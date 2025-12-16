const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinancialReport,
  getTimeReport,
  getClientReport,
  getProjectReport,
  getTaxReport
} = require('../controllers/reportController');

router.get('/financial', protect, getFinancialReport);
router.get('/time', protect, getTimeReport);
router.get('/client', protect, getClientReport);
router.get('/project', protect, getProjectReport);
router.get('/tax', protect, getTaxReport);

module.exports = router;
