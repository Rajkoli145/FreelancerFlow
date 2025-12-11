const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  defaultHourlyRate: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  avatarUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);