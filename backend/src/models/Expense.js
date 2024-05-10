const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Optional associations
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // Expense details
  category: {
    type: String,
    required: true,
    enum: [
      'Software & Tools',
      'Hardware & Equipment',
      'Marketing & Advertising',
      'Office Supplies',
      'Travel & Transportation',
      'Meals & Entertainment',
      'Professional Services',
      'Utilities & Internet',
      'Training & Education',
      'Subscriptions',
      'Taxes & Fees',
      'Other'
    ]
  },
  
  description: {
    type: String,
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Other'],
    default: 'Other'
  },
  
  // Receipt/proof
  receiptUrl: {
    type: String
  },
  
  // Tax deductible flag
  taxDeductible: {
    type: Boolean,
    default: true
  },
  
  notes: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
  
}, { 
  timestamps: true 
});

// Indexes for performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
