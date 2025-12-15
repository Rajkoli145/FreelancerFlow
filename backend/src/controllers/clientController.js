const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const TimeLog = require('../models/TimeLog');
const mongoose = require('mongoose');

exports.createClient = async (req, res, next) => {
  try {
    const newClient = await Client.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, data: newClient });
  }catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ userId: req.user._id });
    res.json({ success: true, data: clients });
  }catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get overall client statistics - outstanding amount across all clients
 */
exports.getAllClientsStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Aggregate outstanding amount across all invoices
    const outstandingResult = await Invoice.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), status: { $ne: 'paid' } } },
      {
        $group: {
          _id: null,
          totalOutstanding: {
            $sum: { $subtract: ['$totalAmount', '$amountPaid'] }
          }
        }
      }
    ]);
    
    const outstandingAmount = outstandingResult.length > 0 
      ? outstandingResult[0].totalOutstanding 
      : 0;
    
    res.json({
      success: true,
      data: {
        outstandingAmount
      }
    });
  } catch (err) {
    console.error('Error fetching client stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get client statistics with aggregated data
 */
exports.getClientStats = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user._id;
    
    // Verify client belongs to user
    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    // Total projects
    const totalProjects = await Project.countDocuments({ clientId, userId });
    const activeProjects = await Project.countDocuments({ clientId, userId, status: 'active' });
    
    // Total invoices
    const totalInvoices = await Invoice.countDocuments({ clientId, userId });
    
    // Total billed (sum of all invoice totals)
    const billedResult = await Invoice.aggregate([
      { $match: { clientId: mongoose.Types.ObjectId(clientId), userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalBilled = billedResult[0]?.total || 0;
    
    // Total paid
    const paidResult = await Invoice.aggregate([
      { $match: { clientId: mongoose.Types.ObjectId(clientId), userId } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalPaid = paidResult[0]?.total || 0;
    
    // Outstanding (unpaid + partial invoices)
    const outstandingResult = await Invoice.aggregate([
      { 
        $match: { 
          clientId: mongoose.Types.ObjectId(clientId), 
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
    const outstanding = outstandingResult[0]?.total || 0;
    
    // Total hours (across all projects for this client)
    const projectIds = await Project.find({ clientId, userId }).distinct('_id');
    const hoursResult = await TimeLog.aggregate([
      { 
        $match: { 
          projectId: { $in: projectIds },
          userId 
        } 
      },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);
    const totalHours = hoursResult[0]?.total || 0;
    
    // Unbilled hours
    const unbilledResult = await TimeLog.aggregate([
      { 
        $match: { 
          projectId: { $in: projectIds },
          userId,
          billable: true,
          invoiced: false
        } 
      },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);
    const unbilledHours = unbilledResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalInvoices,
        totalBilled,
        totalPaid,
        outstanding,
        totalHours: Math.round(totalHours * 10) / 10,
        unbilledHours: Math.round(unbilledHours * 10) / 10
      }
    });
  } catch (err) {
    console.error('Error fetching client stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
