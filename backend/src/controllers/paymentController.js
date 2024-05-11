const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const { createNotification } = require("./notificationController");

/**
 * Create a new payment for an invoice
 */
exports.createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;

    // Validate required fields
    if (!invoiceId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: "Invoice ID and amount are required" 
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Payment amount must be greater than 0" 
      });
    }

    // Find the invoice
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: "Invoice not found" 
      });
    }

    // Calculate amount due
    const amountDue = invoice.totalAmount - invoice.amountPaid;

    // Validate payment amount doesn't exceed amount due
    if (amount > amountDue) {
      return res.status(400).json({ 
        success: false, 
        error: `Payment amount (${amount}) exceeds amount due (${amountDue})` 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user._id,
      invoiceId,
      amount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod: paymentMethod || "other",
      referenceNumber,
      notes
    });

    // Update invoice's amountPaid
    invoice.amountPaid += amount;
    
    // Status will auto-update via pre-save hook
    await invoice.save();

    // Create notification for payment received
    try {
      const notifTitle = invoice.status === 'paid' 
        ? `Invoice ${invoice.invoiceNumber} marked as paid`
        : `Payment of $${amount} received`;
      const notifDesc = invoice.status === 'paid'
        ? `Full payment received for invoice ${invoice.invoiceNumber}`
        : `Partial payment of $${amount} received for invoice ${invoice.invoiceNumber}`;
      
      await createNotification(
        req.user._id,
        invoice.status === 'paid' ? 'invoice_paid' : 'payment_received',
        notifTitle,
        notifDesc,
        'Invoice',
        invoice._id
      );
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr);
      // Don't fail the payment if notification fails
    }

    // Populate payment for response
    await payment.populate('invoiceId', 'invoiceNumber totalAmount amountPaid status');

    res.status(201).json({ 
      success: true, 
      data: payment,
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
        status: invoice.status
      }
    });

  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all payments for the authenticated user
 */
exports.getPayments = async (req, res) => {
  try {
    const { startDate, endDate, invoiceId, paymentMethod } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (invoiceId) {
      query.invoiceId = invoiceId;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate({
        path: 'invoiceId',
        populate: {
          path: 'clientId',
          select: 'name company email'
        }
      })
      .sort({ paymentDate: -1 });

    res.json({ success: true, data: payments });

  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get a single payment by ID
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('invoiceId')
      .populate({
        path: 'invoiceId',
        populate: {
          path: 'clientId',
          select: 'name company email phone'
        }
      });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: "Payment not found" 
      });
    }

    res.json({ success: true, data: payment });

  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete a payment (and reverse invoice payment)
 */
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: "Payment not found" 
      });
    }

    // Find associated invoice
    const invoice = await Invoice.findById(payment.invoiceId);

    if (invoice) {
      // Reduce the amountPaid
      invoice.amountPaid = Math.max(0, invoice.amountPaid - payment.amount);
      // Status will auto-update via pre-save hook
      await invoice.save();
    }

    // Delete the payment
    await Payment.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: "Payment deleted and invoice updated",
      invoice: invoice ? {
        _id: invoice._id,
        amountPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
        status: invoice.status
      } : null
    });

  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all payments for a specific invoice
 */
exports.getInvoicePayments = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Verify invoice belongs to user
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: "Invoice not found" 
      });
    }

    const payments = await Payment.find({ invoiceId })
      .sort({ paymentDate: -1 });

    res.json({ 
      success: true, 
      data: payments,
      summary: {
        totalPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
        paymentCount: payments.length
      }
    });

  } catch (err) {
    console.error('Error fetching invoice payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
