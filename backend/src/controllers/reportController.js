const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const TimeLog = require('../models/TimeLog');
const Project = require('../models/Project');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

/**
 * Get comprehensive financial report
 */
exports.getFinancialReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Revenue (paid invoices)
    const revenueMatch = { userId, status: 'paid' };
    if (Object.keys(dateFilter).length > 0) {
      revenueMatch.updatedAt = dateFilter;
    }
    
    const revenueData = await Invoice.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
          invoiceCount: { $sum: 1 }
        }
      }
    ]);
    
    // Expenses
    const expenseMatch = { userId };
    if (Object.keys(dateFilter).length > 0) {
      expenseMatch.date = dateFilter;
    }
    
    const expenseData = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);
    
    // Tax deductible expenses
    const taxDeductibleData = await Expense.aggregate([
      { $match: { ...expenseMatch, taxDeductible: true } },
      {
        $group: {
          _id: null,
          totalTaxDeductible: { $sum: '$amount' }
        }
      }
    ]);
    
    // Outstanding invoices
    const outstandingData = await Invoice.aggregate([
      { 
        $match: { 
          userId, 
          status: { $in: ['sent', 'partial', 'overdue', 'viewed'] }
        } 
      },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly breakdown
    const monthlyRevenue = await Invoice.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          revenue: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const monthlyExpenses = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          expenses: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Expense by category
    const expenseByCategory = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    const revenue = revenueData[0]?.totalRevenue || 0;
    const expenses = expenseData[0]?.totalExpenses || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: revenue,
          totalExpenses: expenses,
          netProfit: profit,
          profitMargin: parseFloat(profitMargin),
          invoiceCount: revenueData[0]?.invoiceCount || 0,
          expenseCount: expenseData[0]?.expenseCount || 0,
          taxDeductible: taxDeductibleData[0]?.totalTaxDeductible || 0,
          outstandingAmount: outstandingData[0]?.totalOutstanding || 0,
          outstandingCount: outstandingData[0]?.count || 0
        },
        monthlyTrend: mergeMonthlyData(monthlyRevenue, monthlyExpenses),
        expenseByCategory
      }
    });
  } catch (err) {
    console.error('Error generating financial report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get time report
 */
exports.getTimeReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, clientId, projectId } = req.query;
    
    const match = { userId };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    if (projectId) match.projectId = mongoose.Types.ObjectId(projectId);
    
    // Total hours
    const totalHoursData = await TimeLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          entries: { $sum: 1 }
        }
      }
    ]);
    
    // Billable vs Non-billable
    const billableData = await TimeLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$invoiced',
          hours: { $sum: '$hours' }
        }
      }
    ]);
    
    // Hours by project
    const hoursByProject = await TimeLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$projectId',
          hours: { $sum: '$hours' },
          entries: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $sort: { hours: -1 } },
      { $limit: 10 }
    ]);
    
    // Hours by client (via project)
    const hoursByClient = await TimeLog.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$project.clientId',
          hours: { $sum: '$hours' },
          entries: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      { $sort: { hours: -1 } },
      { $limit: 10 }
    ]);
    
    // Daily hours trend
    const dailyHours = await TimeLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          hours: { $sum: '$hours' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);
    
    const billedHours = billableData.find(b => b._id === true)?.hours || 0;
    const unbilledHours = billableData.find(b => b._id === false)?.hours || 0;
    
    res.json({
      success: true,
      data: {
        summary: {
          totalHours: totalHoursData[0]?.totalHours || 0,
          totalEntries: totalHoursData[0]?.entries || 0,
          billedHours,
          unbilledHours,
          billablePercentage: totalHoursData[0]?.totalHours > 0 
            ? ((billedHours / totalHoursData[0].totalHours) * 100).toFixed(2)
            : 0
        },
        hoursByProject: hoursByProject.map(h => ({
          projectId: h._id,
          projectName: h.project?.title || 'Unknown',
          hours: h.hours,
          entries: h.entries
        })),
        hoursByClient: hoursByClient.map(h => ({
          clientId: h._id,
          clientName: h.client?.name || 'Unknown',
          hours: h.hours,
          entries: h.entries
        })),
        dailyTrend: dailyHours
      }
    });
  } catch (err) {
    console.error('Error generating time report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get client report
 */
exports.getClientReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Revenue by client
    const revenueByClient = await Invoice.aggregate([
      { 
        $match: { 
          userId, 
          status: 'paid',
          ...(Object.keys(dateFilter).length > 0 && { updatedAt: dateFilter })
        } 
      },
      {
        $group: {
          _id: '$clientId',
          revenue: { $sum: '$amountPaid' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      { $sort: { revenue: -1 } }
    ]);
    
    // Outstanding by client
    const outstandingByClient = await Invoice.aggregate([
      { 
        $match: { 
          userId,
          status: { $in: ['sent', 'partial', 'overdue', 'viewed'] }
        } 
      },
      {
        $group: {
          _id: '$clientId',
          outstanding: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      { $sort: { outstanding: -1 } }
    ]);
    
    // Active projects by client
    const projectsByClient = await Project.aggregate([
      { $match: { userId, status: 'active' } },
      {
        $group: {
          _id: '$clientId',
          projectCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ]);
    
    res.json({
      success: true,
      data: {
        revenueByClient: revenueByClient.map(r => ({
          clientId: r._id,
          clientName: r.client.name,
          company: r.client.company,
          revenue: r.revenue,
          invoiceCount: r.invoiceCount
        })),
        outstandingByClient: outstandingByClient.map(o => ({
          clientId: o._id,
          clientName: o.client.name,
          company: o.client.company,
          outstanding: o.outstanding,
          invoiceCount: o.invoiceCount
        })),
        activeProjects: projectsByClient.map(p => ({
          clientId: p._id,
          clientName: p.client.name,
          projectCount: p.projectCount
        }))
      }
    });
  } catch (err) {
    console.error('Error generating client report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get project profitability report
 */
exports.getProjectReport = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const projects = await Project.find({ userId })
      .populate('clientId', 'name company')
      .lean();
    
    const projectReports = await Promise.all(
      projects.map(async (project) => {
        // Hours logged
        const hoursData = await TimeLog.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: null, totalHours: { $sum: '$hours' } } }
        ]);
        
        // Revenue from invoices
        const revenueData = await Invoice.aggregate([
          { $match: { projectId: project._id, status: 'paid' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } }
        ]);
        
        // Expenses
        const expenseData = await Expense.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        
        const hours = hoursData[0]?.totalHours || 0;
        const revenue = revenueData[0]?.totalRevenue || 0;
        const expenses = expenseData[0]?.totalExpenses || 0;
        const profit = revenue - expenses;
        const hourlyRate = hours > 0 ? revenue / hours : 0;
        
        return {
          projectId: project._id,
          projectName: project.title,
          clientName: project.clientId?.name || 'Unknown',
          status: project.status,
          hours,
          revenue,
          expenses,
          profit,
          profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0,
          effectiveHourlyRate: hourlyRate.toFixed(2)
        };
      })
    );
    
    // Sort by profit (highest first)
    projectReports.sort((a, b) => b.profit - a.profit);
    
    res.json({
      success: true,
      data: {
        projects: projectReports,
        summary: {
          totalProjects: projectReports.length,
          profitableProjects: projectReports.filter(p => p.profit > 0).length,
          totalRevenue: projectReports.reduce((sum, p) => sum + p.revenue, 0),
          totalExpenses: projectReports.reduce((sum, p) => sum + p.expenses, 0),
          totalProfit: projectReports.reduce((sum, p) => sum + p.profit, 0)
        }
      }
    });
  } catch (err) {
    console.error('Error generating project report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get tax summary report
 */
exports.getTaxReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    
    // Total income
    const incomeData = await Invoice.aggregate([
      { 
        $match: { 
          userId,
          status: 'paid',
          updatedAt: { $gte: startOfYear, $lte: endOfYear }
        } 
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amountPaid' },
          taxCollected: { $sum: '$taxAmount' }
        }
      }
    ]);
    
    // Tax deductible expenses by category
    const deductibleExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId,
          taxDeductible: true,
          date: { $gte: startOfYear, $lte: endOfYear }
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Total deductible
    const totalDeductible = deductibleExpenses.reduce((sum, exp) => sum + exp.total, 0);
    
    // Monthly income breakdown
    const monthlyIncome = await Invoice.aggregate([
      { 
        $match: { 
          userId,
          status: 'paid',
          updatedAt: { $gte: startOfYear, $lte: endOfYear }
        } 
      },
      {
        $group: {
          _id: { $month: '$updatedAt' },
          income: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    const grossIncome = incomeData[0]?.totalIncome || 0;
    const taxableIncome = grossIncome - totalDeductible;
    
    res.json({
      success: true,
      data: {
        year: currentYear,
        summary: {
          grossIncome,
          totalDeductions: totalDeductible,
          taxableIncome,
          taxCollected: incomeData[0]?.taxCollected || 0
        },
        deductibleExpenses,
        monthlyIncome: formatMonthlyData(monthlyIncome)
      }
    });
  } catch (err) {
    console.error('Error generating tax report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper functions
function mergeMonthlyData(revenue, expenses) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const merged = {};
  
  revenue.forEach(r => {
    const key = `${r._id.year}-${r._id.month}`;
    if (!merged[key]) merged[key] = { year: r._id.year, month: r._id.month, revenue: 0, expenses: 0 };
    merged[key].revenue = r.revenue;
  });
  
  expenses.forEach(e => {
    const key = `${e._id.year}-${e._id.month}`;
    if (!merged[key]) merged[key] = { year: e._id.year, month: e._id.month, revenue: 0, expenses: 0 };
    merged[key].expenses = e.expenses;
  });
  
  return Object.values(merged)
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(m => ({
      month: monthNames[m.month - 1],
      revenue: m.revenue,
      expenses: m.expenses,
      profit: m.revenue - m.expenses
    }));
}

function formatMonthlyData(data) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return data.map(d => ({
    month: monthNames[d._id - 1],
    income: d.income
  }));
}
