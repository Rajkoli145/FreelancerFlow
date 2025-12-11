const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} = require("../controllers/clientController");

// Create a new client
router.post("/", protect, createClient);

// Get all clients for the authenticated user
router.get("/", protect, getClients);

// Get a single client by ID
router.get("/:id", protect, getClientById);

// Update a client by ID
router.put("/:id", protect, updateClient);

// Delete a client by ID
router.delete("/:id", protect, deleteClient);

module.exports = router;
