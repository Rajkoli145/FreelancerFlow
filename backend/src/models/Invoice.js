const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  items: [
    {
      description: String, 
      hours: Number,
      rate: Number,
      amount: Number
    }
  ],

  totalAmount: Number,

  status: {
    type: String,
    enum: ["unpaid", "paid", "overdue"],
    default: "unpaid"
  },

  invoiceNumber: String,
  issueDate: Date,
  dueDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
