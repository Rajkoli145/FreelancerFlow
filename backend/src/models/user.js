const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  defaultHourlyRate: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  avatarUrl: { type: String },
  profilePicture: { type: String }, // Base64 encoded image or URL
  firebaseUid: { type: String }, // Firebase UID for OAuth users
  authProvider: { type: String, enum: ['email', 'google', 'github'], default: 'email' }, // Auth provider
  profilePhoto: { type: String }, // Profile photo URL from OAuth
  role: { type: String, enum: ['freelancer', 'admin'], default: 'freelancer' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);