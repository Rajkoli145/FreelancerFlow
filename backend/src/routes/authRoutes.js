const express = require("express");
const {body} = require("express-validator");
const router = express.Router();
const { signup, login, getMe, updateProfile, updatePassword } = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');


// Signup route
router.post(
  "/signup",
  [
    body("fullName").not().isEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signup
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").not().isEmpty().withMessage("Password is required"),
  ],
  login
);

// Get current user
router.get('/me', protect, getMe); 

// Update profile
router.put('/profile', protect, updateProfile);

// Update password
router.put('/password', protect, updatePassword);

module.exports = router;