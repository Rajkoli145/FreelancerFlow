const TimeLog = require("../models/TimeLog");

exports.createTimeLog = async (req, res, next) => {
  try {
    const log = await TimeLog.create({
      userId: req.user._id,
      projectId: req.body.projectId,
      hours: req.body.hours,
      description: req.body.description,
      notes: req.body.notes,
      date: req.body.date
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getTimeLogs = async (req, res, next) => {
  try {
    const logs = await TimeLog.find({ userId: req.user._id }).populate('projectId');
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTimeLogById = async (req, res, next) => {
  try {
    const log = await TimeLog.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).populate('projectId');
    
    if (!log) {
      return res.status(404).json({ success: false, error: "Time log not found" });
    }
    
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.updateTimeLog = async (req, res, next) => {
  try {
  const log = await TimeLog.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );
  
  if (!log) {
    return res.status(404).json({ success: false, error: "Time log not found" });
  }
  res.json({ success: true, data: log });
} catch (err) {
  res.status(500).json({ success: false, error: err.message });
}
};


exports.deleteTimeLog = async (req, res, next) => {
  try {
    const log = await TimeLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({ success: false, error: "Time log not found" });
    }

    res.json({ success: true, message: "Time log deleted" });
  }catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};