const Project = require('../models/Project');

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
  };

  exports.getProjects = async (req, res, next) => {
    try {
      const projects = await Project.find({ userId: req.user._id });
      res.json({ success: true, data: projects });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.getProjectById = async (req, res, next) => {
    try {
      const project = await Project.findOne({ 
        _id: req.params.id, 
        userId: req.user._id 
      });
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      res.json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.updateProject = async (req, res, next) => {
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

  exports.deleteProject = async (req, res, next) => {
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
    
    // Count active projects
    const active = await Project.countDocuments({ userId, status: 'Active' });
    
    // Calculate hours this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const TimeLog = require('../models/TimeLog');
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