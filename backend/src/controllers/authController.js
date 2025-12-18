const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { jwtSecret, jwtExpire } = require("../config/config");

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    const { fullName, email, password, defaultHourlyRate, currency } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "Email already registered" });
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
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });

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
  } catch (err) {
    next(err);
  }
};

// sample protected route to return current user
const getMe = async (req, res, next) => {
  try {
    const user = req.user; // set by auth middleware
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Update user profile (name, email, hourlyRate)
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, defaultHourlyRate, profilePicture, currency } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already in use"
        });
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
  } catch (err) {
    next(err);
  }
};

// Update password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters"
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, updateProfile, updatePassword };
