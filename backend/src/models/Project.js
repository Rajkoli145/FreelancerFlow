const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: true // CRITICAL: Every project MUST have a client
  },
  
  // Project Info
  title: { type: String, required: true },
  description: { type: String },
  
  // Billing Configuration
  billingType: {
    type: String,
    enum: ['Hourly', 'Fixed'],
    default: 'Hourly',
    required: true
  },
  hourlyRate: { 
    type: Number,
    min: 0
    // Required if billingType = 'Hourly' (validated in controller)
  },
  fixedPrice: { 
    type: Number,
    min: 0
    // Required if billingType = 'Fixed' (validated in controller)
  },
  
  // Dates
  startDate: { type: Date },
  deadline: { type: Date },
  completedDate: { type: Date },
  
  // Status - using consistent lowercase
  status: { 
    type: String,
    enum: ['active', 'on_hold', 'completed', 'cancelled'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Validate billing fields based on billingType
projectSchema.pre('save', function() {
  if (this.billingType === 'Hourly' && !this.hourlyRate) {
    throw new Error('Hourly rate is required for hourly billing type');
  }
  if (this.billingType === 'Fixed' && !this.fixedPrice) {
    throw new Error('Fixed price is required for fixed billing type');
  }
});

// Index for faster queries
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ clientId: 1 });

module.exports = mongoose.model('Project', projectSchema);