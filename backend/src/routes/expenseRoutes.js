const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expenseController');

// Stats route (must be before /:id)
router.get('/stats', protect, getExpenseStats);

// CRUD routes
router.post('/', protect, createExpense);
router.get('/', protect, getExpenses);
router.get('/:id', protect, getExpenseById);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
