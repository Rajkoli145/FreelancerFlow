const Client = require('../models/Client');

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
