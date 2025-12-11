const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  hours:{ type: Number, required: true },
  description: { type: String, required: true },
  notes: { type: String },
  date: { type: Date, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TimeLog", timeLogSchema);
  