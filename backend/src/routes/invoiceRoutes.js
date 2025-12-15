const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markAsPaid,
  downloadInvoice,
  getInvoiceStats
} = require("../controllers/invoiceController");

// Create a new invoice
router.post("/", protect, createInvoice);
// Get invoice statistics (must be before /:id route)
router.get("/stats", protect, getInvoiceStats);
// Get all invoices for the authenticated user
router.get("/", protect, getInvoices);
// Get a single invoice by ID
router.get("/:id", protect, getInvoiceById);
// Update an invoice
router.put("/:id", protect, updateInvoice);
// Delete an invoice
router.delete("/:id", protect, deleteInvoice);
// Mark an invoice as paid manually
router.put("/:id/paid", protect, markAsPaid);
// Download invoice as PDF
router.get("/:id/pdf", protect, downloadInvoice);


module.exports = router;

