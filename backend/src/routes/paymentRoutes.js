const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPayment,
  getPayments,
  getPaymentById,
  deletePayment,
  getInvoicePayments
} = require("../controllers/paymentController");

// Create a new payment
router.post("/", protect, createPayment);

// Get all payments for the authenticated user
router.get("/", protect, getPayments);

// Get a single payment by ID
router.get("/:id", protect, getPaymentById);

// Delete a payment
router.delete("/:id", protect, deletePayment);

// Get all payments for a specific invoice
router.get("/invoice/:invoiceId", protect, getInvoicePayments);

module.exports = router;
