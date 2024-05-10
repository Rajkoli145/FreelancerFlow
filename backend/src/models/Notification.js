const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification details
  type: {
    type: String,
    enum: [
      'invoice_paid',
      'invoice_overdue',
      'payment_received',
      'invoice_sent',
      'project_deadline',
      'system'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Related entity
  relatedEntityType: {
    type: String,
    enum: ['Invoice', 'Payment', 'Project', 'Client', 'System'],
    required: false
  },
  
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
