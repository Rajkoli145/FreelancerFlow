const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists for auth

// All routes here are protected
router.use(protect);

router.get('/metrics', adminController.getPlatformMetrics);

module.exports = router;
