const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
    index: true
  },
  
  // Payment Details
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  paymentDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: [
      "bank_transfer",
      "upi", 
      "cash",
      "credit_card",
      "debit_card",
      "cheque",
      "other"
    ],
    default: "other",
    required: true
  },
  
  // Reference & Notes
  referenceNumber: { type: String },
  notes: { type: String },
  
  // External Integration
  stripePaymentIntentId: { type: String },
  
}, { 
  timestamps: true 
});

// Indexes for performance
paymentSchema.index({ userId: 1, paymentDate: -1 });
paymentSchema.index({ invoiceId: 1, paymentDate: -1 });

// Validation: Ensure payment doesn't exceed invoice amount
// This will be handled in the controller with proper invoice lookup

module.exports = mongoose.model("Payment", paymentSchema);
