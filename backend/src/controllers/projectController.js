const Project = require('../models/Project');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const TimeLog = require('../models/TimeLog');
const mongoose = require('mongoose');

exports.createProject = async (req, res) => {
  try {
    const { clientId, billingType, hourlyRate, fixedPrice, ...projectData } = req.body;
    
    console.log('Creating project with data:', { clientId, billingType, hourlyRate, fixedPrice, projectData });
    
    // Validate clientId is provided and exists
    if (!clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client is required for creating a project' 
      });
    }
    
    const client = await Client.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        error: 'Client not found' 
      });
    }
    
    // Validate billing type fields
    if (billingType === 'Hourly' && (!hourlyRate || hourlyRate <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Hourly rate is required for hourly billing type' 
      });
    }
    
    if (billingType === 'Fixed' && (!fixedPrice || fixedPrice <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Fixed price is required for fixed billing type' 
      });
    }
    
    const project = await Project.create({
      userId: req.user._id,
      clientId,
      billingType: billingType || 'Hourly',
      hourlyRate: billingType === 'Hourly' ? hourlyRate : undefined,
      fixedPrice: billingType === 'Fixed' ? fixedPrice : undefined,
      ...projectData
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    console.error('❌ Error creating project:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Send detailed error for debugging
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }
    
    res.status(500).json({ success: false, error: err.message });
  }
};

  exports.getProjects = async (req, res) => {
    try {
      const projects = await Project.find({ userId: req.user._id }).populate('clientId', 'name email company');
      res.json({ success: true, data: projects });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.getProjectById = async (req, res) => {
    try {
      const project = await Project.findOne({ 
        _id: req.params.id, 
        userId: req.user._id 
      }).populate('clientId', 'name email company phone');
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      res.json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.updateProject = async (req, res) => {
    try {
      const project = await Project.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
      );
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.deleteProject = async (req, res) => {
    try{
      const project = await Project.findOneAndDelete(
        { _id: req.params.id, userId: req.user._id }
      );
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

/**
 * Get project statistics for the authenticated user
 */
exports.getProjectStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count total projects
    const total = await Project.countDocuments({ userId });
    
    // Count active projects - FIX: use lowercase 'active' not 'Active'
    const active = await Project.countDocuments({ userId, status: 'active' });
    
    // Calculate hours this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const hoursResult = await TimeLog.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' }
        }
      }
    ]);
    
    const hoursThisMonth = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;
    
    res.json({
      success: true,
      total,
      active,
      hoursThisMonth: Math.round(hoursThisMonth * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get statistics for a specific project
 */
exports.getProjectStatsById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;
    
    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Total hours logged
    const hoursResult = await TimeLog.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(projectId), userId } },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);
    const totalHours = hoursResult[0]?.total || 0;
    
    // Unbilled hours
    const unbilledResult = await TimeLog.aggregate([
      { 
        $match: { 
          projectId: mongoose.Types.ObjectId(projectId), 
          userId,
          billable: true,
          invoiced: false
        } 
      },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);
    const unbilledHours = unbilledResult[0]?.total || 0;
    
    // Total billed (sum of invoice totals for this project)
    const billedResult = await Invoice.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(projectId), userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalBilled = billedResult[0]?.total || 0;
    
    // Total paid
    const paidResult = await Invoice.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(projectId), userId } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalPaid = paidResult[0]?.total || 0;
    
    // Pending invoices amount
    const pendingResult = await Invoice.aggregate([
      { 
        $match: { 
          projectId: mongoose.Types.ObjectId(projectId), 
          userId,
          status: { $in: ['sent', 'partial', 'overdue', 'viewed'] }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } 
        } 
      }
    ]);
    const pendingAmount = pendingResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        totalHours: Math.round(totalHours * 10) / 10,
        unbilledHours: Math.round(unbilledHours * 10) / 10,
        totalBilled,
        totalPaid,
        pendingAmount
      }
    });
  } catch (err) {
    console.error('Error fetching project stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};