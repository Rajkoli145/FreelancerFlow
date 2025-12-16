const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Basic Info
  clientType: {
    type: String,
    enum: ["Individual", "Company"],
    default: "Individual"
  },
  name: { type: String, required: true },
  company: { type: String },
  email: { 
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: { type: String },
  website: { type: String },
  
  // Billing Address
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "India" }
  },
  
  // Tax & Financial
  taxId: { type: String }, // GST/PAN/TIN
  currency: { type: String, default: "INR" },
  defaultHourlyRate: { type: Number, min: 0 },
  
  // Status
  status: {
    type: String,
    enum: ["Active", "Archived"],
    default: "Active"
  },
  
  // Notes
  notes: { type: String }
}, { 
  timestamps: true 
});

// Virtual for full address
clientSchema.virtual('fullAddress').get(function() {
  if (!this.billingAddress) return null;
  const addr = this.billingAddress;
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
});

// Ensure virtuals are included in JSON
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

// Index for faster queries
clientSchema.index({ userId: 1, status: 1 });
clientSchema.index({ userId: 1, email: 1 });

module.exports = mongoose.model("Client", clientSchema);
