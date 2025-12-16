const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  getAllClientsStats
} = require("../controllers/clientController");

// Create a new client
router.post("/", protect, createClient);

// Get overall stats (must be before /:id routes)
router.get("/stats/all", protect, getAllClientsStats);

// Get all clients for the authenticated user
router.get("/", protect, getClients);

// Get a single client by ID
router.get("/:id", protect, getClientById);

// Get client statistics (must be before general /:id to avoid conflicts with 'stats' as id)
router.get("/:id/stats", protect, getClientStats);

// Update a client by ID
router.put("/:id", protect, updateClient);

// Delete a client by ID
router.delete("/:id", protect, deleteClient);

module.exports = router;
