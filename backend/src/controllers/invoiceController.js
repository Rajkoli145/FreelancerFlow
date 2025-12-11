const Invoice = require("../models/Invoice");
const TimeLog = require("../models/TimeLog");
const generateInvoicePDF = require("../utils/pdfGenerator");
const generateInvoiceNumber = require("../utils/invoiceNumberHelper");
const Client = require("../models/Client");
const Project = require("../models/Project");

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { clientId, projectId, items, dueDate } = req.body;

    let invoiceItems = [];
    let totalAmount = 0;

    // If items are provided in request body, use them directly
    if (items && Array.isArray(items) && items.length > 0) {
      // Calculate amount for each item if not provided
      invoiceItems = items.map(item => ({
        description: item.description || '',
        hours: item.hours || 0,
        rate: item.rate || 0,
        amount: item.amount || (item.hours * item.rate) // Calculate if not provided
      }));
      
      // Calculate total amount from all items
      totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    } else {
      // Otherwise, fetch time logs and generate items from them
      const logs = await TimeLog.find({
        projectId,
        userId: req.user._id
      });

      if (logs.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "No items provided and no time logs found for this project" 
        });
      }

      // Get rate from request body or use default
      const rate = req.body.rate || 0;

      // Convert logs into invoice items
      invoiceItems = logs.map(log => ({
        description: log.task,
        hours: log.hours,
        rate,
        amount: log.hours * rate
      }));

      totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(req.user);

    const invoice = await Invoice.create({
      userId: req.user._id,
      clientId,
      projectId,
      items: invoiceItems,
      totalAmount,
      dueDate,
      invoiceNumber
    });

    res.json({ success: true, data: invoice });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get all invoices (auto overdue update)
exports.getInvoices = async (req, res) => {
  try {
    let invoices = await Invoice.find({ userId: req.user._id });

    for (let inv of invoices) {
      if (inv.status === "unpaid" && new Date() > inv.dueDate) {
        inv.status = "overdue";
        await inv.save();
      }
    }

    res.json({ success: true, data: invoices });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get one invoice
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

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
