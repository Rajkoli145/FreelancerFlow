const mongoose = require('mongoose');
const { mongoUri } = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri); // no options needed now
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
