const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

/**
 * Get comprehensive dashboard statistics for the authenticated user
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Total earnings (all paid amounts from invoices)
    const totalEarningsResult = await Invoice.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalEarnings = totalEarningsResult[0]?.total || 0;

    // This month earnings (paid invoices updated this month)
    const thisMonthResult = await Invoice.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'paid',
          updatedAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const thisMonthEarnings = thisMonthResult[0]?.total || 0;

    // Pending invoices count (sent, partial, overdue)
    const pendingInvoices = await Invoice.countDocuments({
      userId,
      status: { $in: ['sent', 'partial', 'overdue', 'viewed'] }
    });

    // Active projects count
    const activeProjects = await Project.countDocuments({
      userId,
      status: 'active'
    });

    // Hours logged this month
    const hoursResult = await TimeLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);
    const hoursThisMonth = hoursResult[0]?.total || 0;

    // Earnings chart (last 6 months)
    const earningsChart = await Invoice.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'paid',
          createdAt: { $gte: startOf6MonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format earnings chart with all 6 months (fill missing months with 0)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const earningsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = earningsChart.find(item =>
        item._id.year === date.getFullYear() && item._id.month === date.getMonth() + 1
      );
      earningsData.push({
        month: monthNames[date.getMonth()],
        amount: monthData ? monthData.amount : 0
      });
    }

    // Productivity chart (last 4 weeks)
    const productivityData = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekHours = await TimeLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: weekStart, $lte: weekEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]);

      productivityData.push({
        week: `W${4 - i}`,
        hours: Math.round((weekHours[0]?.total || 0) * 10) / 10
      });
    }

    // Recent invoices (last 5)
    const recentInvoices = await Invoice.find({ userId })
      .populate('clientId', 'name company')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent time logs (last 5)
    const recentTimeLogs = await TimeLog.find({ userId })
      .populate('projectId', 'title status')
      .sort({ date: -1 })
      .limit(5);

    // Total expenses this month
    const expensesResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthExpenses = expensesResult[0]?.total || 0;

    // Net profit this month (earnings - expenses)
    const netProfit = thisMonthEarnings - thisMonthExpenses;

    res.json({
      success: true,
      data: {
        stats: {
          totalEarnings,
          thisMonth: thisMonthEarnings,
          hoursLogged: Math.round(hoursThisMonth * 10) / 10,
          pendingInvoices,
          activeProjects,
          expenses: thisMonthExpenses,
          netProfit: Math.round(netProfit * 100) / 100
        },
        earningsData,
        productivityData,
        recentInvoices,
        recentTimeLogs
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
