const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { jwtSecret, jwtExpire } = require("../config/config");
const { catchAsync } = require("../middleware/errorMiddleware");
const { AppError, AuthenticationError, ConflictError } = require("../utils/errors");

const signup = catchAsync(async (req, res, next) => {
  const { fullName, email, password, defaultHourlyRate, currency } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    defaultHourlyRate,
    currency,
  });

  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency || 'USD',
        defaultHourlyRate: user.defaultHourlyRate || 0,
        profilePicture: user.profilePicture,
        role: user.role
      },
      token,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthenticationError("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthenticationError("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency || 'USD',
        defaultHourlyRate: user.defaultHourlyRate || 0,
        profilePicture: user.profilePicture,
        role: user.role
      },
      token,
    },
  });
});

// sample protected route to return current user
const getMe = catchAsync(async (req, res, next) => {
  res.json({ success: true, data: req.user });
});

// Update user profile (name, email, hourlyRate)
const updateProfile = catchAsync(async (req, res, next) => {
  const { fullName, email, defaultHourlyRate, profilePicture, currency } = req.body;
  const userId = req.user._id;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }
  }

  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (defaultHourlyRate !== undefined) updateData.defaultHourlyRate = defaultHourlyRate;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
  if (currency) updateData.currency = currency;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-passwordHash');

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

// Update password
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AuthenticationError("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

module.exports = { signup, login, getMe, updateProfile, updatePassword };
