const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  
  // Time Entry
  date: { type: Date, required: true },
  hours: { 
    type: Number, 
    required: true,
    min: 0.25,
    max: 24
  },
  description: { type: String, required: true },
  notes: { type: String },
  
  // Billing Status - CRITICAL for preventing double-billing
  billable: { 
    type: Boolean, 
    default: true 
  },
  invoiced: { 
    type: Boolean, 
    default: false,
    index: true // Index for fast queries of unbilled hours
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  }
}, { 
  timestamps: true 
});

// Validate that invoiceId is set when invoiced = true
timeLogSchema.pre('save', function() {
  if (this.invoiced && !this.invoiceId) {
    throw new Error('Invoice ID is required when marking time log as invoiced');
  }
  if (!this.invoiced && this.invoiceId) {
    // Auto-mark as invoiced if invoiceId is set
    this.invoiced = true;
  }
});

// Index for common queries
timeLogSchema.index({ userId: 1, projectId: 1 });
timeLogSchema.index({ userId: 1, invoiced: 1, billable: 1 }); // For unbilled hours queries

module.exports = mongoose.model("TimeLog", timeLogSchema);
  