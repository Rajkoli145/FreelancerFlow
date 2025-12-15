const Invoice = require("../models/Invoice");
const TimeLog = require("../models/TimeLog");
const Client = require("../models/Client");
const Project = require("../models/Project");
const generateInvoicePDF = require("../utils/pdfGenerator");
const generateInvoiceNumber = require("../utils/invoiceNumberHelper");
const { createNotification } = require("./notificationController");

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { clientId, projectId, items, dueDate, taxRate, discountAmount, notes } = req.body;

    // Validate client exists
    const client = await Client.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        error: "Client not found" 
      });
    }

    // If projectId provided, verify it belongs to the client
    if (projectId) {
      const project = await Project.findOne({ 
        _id: projectId, 
        userId: req.user._id 
      });
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          error: "Project not found" 
        });
      }
      
      if (project.clientId.toString() !== clientId.toString()) {
        return res.status(400).json({ 
          success: false, 
          error: "Project does not belong to the selected client" 
        });
      }
    }

    let invoiceItems = [];
    let subtotal = 0;

    // If items are provided in request body, use them directly
    if (items && Array.isArray(items) && items.length > 0) {
      invoiceItems = items.map(item => {
        const quantity = item.quantity || item.hours || 1;
        const rate = item.rate || 0;
        const amount = item.amount || (quantity * rate);
        
        subtotal += amount;
        
        return {
          description: item.description || '',
          quantity: quantity,
          rate: rate,
          amount: amount,
          timeLogId: item.timeLogId || undefined
        };
      });
    } else if (projectId) {
      // Generate items from unbilled time logs
      const unbilledLogs = await TimeLog.find({
        projectId,
        userId: req.user._id,
        billable: true,
        invoiced: false
      });

      if (unbilledLogs.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "No unbilled time logs found for this project" 
        });
      }

      // Get project for hourly rate
      const project = await Project.findById(projectId);
      const rate = project.hourlyRate || 0;

      // Convert logs into invoice items
      invoiceItems = unbilledLogs.map(log => {
        const amount = log.hours * rate;
        subtotal += amount;
        
        return {
          description: log.description,
          quantity: log.hours,
          rate: rate,
          amount: amount,
          timeLogId: log._id
        };
      });

      // Mark time logs as invoiced (will be updated after invoice creation)
    } else {
      return res.status(400).json({ 
        success: false, 
        error: "Either items or projectId with unbilled hours must be provided" 
      });
    }

    // Calculate financial breakdown
    const calculatedTaxRate = taxRate || 0;
    const taxAmount = (subtotal * calculatedTaxRate) / 100;
    const calculatedDiscountAmount = discountAmount || 0;
    const totalAmount = subtotal + taxAmount - calculatedDiscountAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(req.user);

    // Create invoice
    const invoice = await Invoice.create({
      userId: req.user._id,
      clientId,
      projectId: projectId || undefined,
      items: invoiceItems,
      subtotal,
      taxRate: calculatedTaxRate,
      taxAmount,
      discountAmount: calculatedDiscountAmount,
      totalAmount,
      amountPaid: 0,
      currency: client.currency || 'INR',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      invoiceNumber,
      notes,
      status: 'draft'
    });

    // Mark time logs as invoiced
    if (projectId && invoiceItems.length > 0) {
      const timeLogIds = invoiceItems
        .map(item => item.timeLogId)
        .filter(Boolean);
      
      if (timeLogIds.length > 0) {
        await TimeLog.updateMany(
          { _id: { $in: timeLogIds } },
          { 
            $set: { 
              invoiced: true,
              invoiceId: invoice._id
            }
          }
        );
      }
    }

    res.status(201).json({ success: true, data: invoice });

  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('clientId', 'name email company')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    // Check for overdue invoices and create notifications
    const now = new Date();
    for (const invoice of invoices) {
      if (invoice.status !== 'paid' && new Date(invoice.dueDate) < now) {
        // Check if notification already exists for this overdue invoice
        const Notification = require("../models/Notification");
        const existingNotification = await Notification.findOne({
          userId: req.user._id,
          type: 'invoice_overdue',
          relatedEntityType: 'Invoice',
          relatedEntityId: invoice._id
        });

        if (!existingNotification) {
          const clientName = invoice.clientId?.name || 'Unknown Client';
          await createNotification(
            req.user._id,
            'invoice_overdue',
            `Invoice ${invoice.invoiceNumber} is overdue`,
            `Payment from ${clientName} is overdue. Due date was ${new Date(invoice.dueDate).toLocaleDateString()}.`,
            'Invoice',
            invoice._id
          );
        }
      }
    }

    res.json({ success: true, data: invoices });

  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get one invoice
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('clientId', 'name email company phone address')
      .populate('projectId', 'title hourlyRate');

    if (!invoice)
      return res.status(404).json({ success: false, error: "Invoice not found" });

    res.json({ success: true, data: invoice });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Mark invoice paid manually
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, error: "Invoice not found" });

    // Authorization check - verify invoice belongs to authenticated user
    if (invoice.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized to modify this invoice" });
    }

    invoice.status = "paid";
    await invoice.save();

    res.json({ success: true, data: invoice });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: "Invoice not found" });
    }

    // Update invoice fields
    Object.assign(invoice, req.body);
    await invoice.save();

    res.json({ success: true, data: invoice });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: "Invoice not found" });
    }

    res.json({ success: true, message: "Invoice deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Generate PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: "Invoice not found" });

    const client = await Client.findById(invoice.clientId);
    const project = await Project.findById(invoice.projectId);

    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found for this invoice" });
    }
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found for this invoice" });
    }

    const filePath = await generateInvoicePDF(invoice, client, project);

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get invoice statistics grouped by status
 */
exports.getInvoiceStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Invoice.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$amountPaid' }
        }
      }
    ]);
    
    // Format response with all possible statuses
    const result = {
      total: 0,
      draft: 0,
      sent: 0,
      viewed: 0,
      partial: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      urgent: 0 // overdue + partial
    };
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });
    
    // Calculate urgent count (overdue + partial)
    result.urgent = (result.overdue || 0) + (result.partial || 0);
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching invoice stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
