const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
    // Optional - invoice can be for multiple projects or manual items
  },

  // Invoice Identity
  invoiceNumber: { 
    type: String,
    required: true
  },
  
  // Dates
  issueDate: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  dueDate: { 
    type: Date,
    required: true
  },

  // Line Items
  items: [
    {
      description: { type: String, required: true }, 
      quantity: { type: Number, default: 1 }, // hours or units
      rate: { type: Number, required: true },
      amount: { type: Number, required: true },
      timeLogId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "TimeLog" 
      }
    }
  ],

  // Financial Breakdown
  subtotal: { 
    type: Number, 
    required: true,
    min: 0
  },
  taxRate: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 // Percentage
  },
  taxAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  discountAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Late Fees
  lateFeeRate: {
    type: Number,
    default: 0, // Percentage per day or fixed amount per day
    min: 0
  },
  lateFeeType: {
    type: String,
    enum: ['percentage', 'fixed'], // percentage of total or fixed amount per day
    default: 'percentage'
  },
  lateFeeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalAmount: { 
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Tracking
  amountPaid: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Currency
  currency: { 
    type: String, 
    default: "INR" 
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "sent", "viewed", "partial", "paid", "overdue", "cancelled"],
    default: "draft"
  },

  // Notes
  notes: { type: String }
}, { 
  timestamps: true 
});

// Virtual for amount due
invoiceSchema.virtual('amountDue').get(function() {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

// Method to calculate late fees
invoiceSchema.methods.calculateLateFee = function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  
  // Only calculate if invoice is overdue and not fully paid
  if (dueDate >= now || this.status === 'paid') {
    return 0;
  }
  
  // Calculate days overdue
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue <= 0 || this.lateFeeRate === 0) {
    return 0;
  }
  
  let lateFee = 0;
  
  if (this.lateFeeType === 'percentage') {
    // Percentage of total amount per day
    const baseAmount = this.subtotal + this.taxAmount - this.discountAmount;
    lateFee = (baseAmount * this.lateFeeRate / 100) * daysOverdue;
  } else {
    // Fixed amount per day
    lateFee = this.lateFeeRate * daysOverdue;
  }
  
  return Math.round(lateFee * 100) / 100; // Round to 2 decimal places
};

// Pre-save hook to auto-calculate financial fields
invoiceSchema.pre('save', function() {
  // Auto-calculate tax amount
  if (this.isModified('subtotal') || this.isModified('taxRate')) {
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
  }
  
  // Calculate late fee if overdue
  const calculatedLateFee = this.calculateLateFee();
  if (calculatedLateFee > 0) {
    this.lateFeeAmount = calculatedLateFee;
  }
  
  // Auto-calculate total amount (including late fees)
  if (this.isModified('subtotal') || this.isModified('taxAmount') || this.isModified('discountAmount') || this.isModified('lateFeeAmount')) {
    this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount + (this.lateFeeAmount || 0);
  }
  
  // Auto-update status based on payment
  if (this.isModified('amountPaid') || this.isModified('totalAmount')) {
    const amountDue = this.totalAmount - this.amountPaid;
    const now = new Date();
    
    if (this.amountPaid >= this.totalAmount) {
      this.status = 'paid';
    } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
      this.status = 'partial';
    } else if (this.amountPaid === 0 && this.dueDate && this.dueDate < now && this.status !== 'draft') {
      this.status = 'overdue';
    }
  }
});

// Ensure virtuals are included in JSON
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

// Indexes for performance
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ projectId: 1 });
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true }); // Prevent duplicate invoice numbers per user

module.exports = mongoose.model("Invoice", invoiceSchema);
