const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  defaultHourlyRate: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  avatarUrl: { type: String },
  profilePicture: { type: String }, // Base64 encoded image or URL
  firebaseUid: { type: String }, // Firebase UID for OAuth users
  authProvider: { type: String, enum: ['email', 'google', 'github'], default: 'email' }, // Auth provider
  profilePhoto: { type: String }, // Profile photo URL from OAuth
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);