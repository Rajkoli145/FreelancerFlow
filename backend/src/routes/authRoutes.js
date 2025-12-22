const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { firebaseAuth } = require('../controllers/firebaseAuthController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Signup route
router.post("/signup", validate('signup'), signup);

// Login route
router.post("/login", validate('login'), login);

// Firebase OAuth route (Google, GitHub)
router.post('/firebase', firebaseAuth);

// Get current user
router.get('/me', protect, getMe);

// Update profile
router.put('/profile', protect, validate('updateProfile'), updateProfile);

// Update password
router.put('/password', protect, validate('updatePassword'), updatePassword);

module.exports = router;