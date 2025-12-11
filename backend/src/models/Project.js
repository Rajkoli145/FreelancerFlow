const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "pending" }, // pending, ongoing, completed
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);