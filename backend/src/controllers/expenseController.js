const Expense = require('../models/Expense');
const Client = require('../models/Client');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { clientId, projectId, category, description, amount, date, paymentMethod, taxDeductible, notes } = req.body;

    // Validate client if provided
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, userId: req.user._id });
      if (!client) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }
    }

    // Validate project if provided
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, userId: req.user._id });
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
    }

    const expense = await Expense.create({
      userId: req.user._id,
      clientId,
      projectId,
      category,
      description,
      amount,
      date: date || Date.now(),
      paymentMethod,
      taxDeductible,
      notes
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('clientId', 'name company')
      .populate('projectId', 'title');

    res.status(201).json({ success: true, data: populatedExpense });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const { category, clientId, projectId, startDate, endDate, taxDeductible } = req.query;

    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (clientId) filter.clientId = clientId;
    if (projectId) filter.projectId = projectId;
    if (taxDeductible !== undefined) filter.taxDeductible = taxDeductible === 'true';

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('clientId', 'name company')
      .populate('projectId', 'title')
      .sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('clientId', 'name company')
      .populate('projectId', 'title');

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    console.error('Error fetching expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('clientId', 'name company')
      .populate('projectId', 'title');

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get expense stats
exports.getExpenseStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // This month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Tax deductible expenses
    const taxDeductibleExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          taxDeductible: true
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // By category
    const byCategory = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Last 6 months trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trend
    const formattedTrend = monthlyTrend.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: monthNames[item._id.month - 1],
        expenses: item.total,
        count: item.count
      };
    });

    res.json({
      success: true,
      data: {
        totalExpenses: totalExpenses[0]?.total || 0,
        thisMonth: thisMonthExpenses[0]?.total || 0,
        taxDeductible: taxDeductibleExpenses[0]?.total || 0,
        byCategory,
        monthlyTrend: formattedTrend
      }
    });
  } catch (err) {
    console.error('Error fetching expense stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
