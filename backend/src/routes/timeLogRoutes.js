const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createTimeLog,
  getTimeLogs,
  getTimeLogById,
  updateTimeLog,
  deleteTimeLog
} = require("../controllers/timeLogController");

// Create a new time log
router.post("/", protect, createTimeLog);

// Get all time logs for the authenticated user
router.get("/", protect, getTimeLogs);


// Get a single time log by ID
router.get("/:id", protect, getTimeLogById);

// Update a time log by ID
router.put("/:id", protect, updateTimeLog);

// Delete a time log by ID
router.delete("/:id", protect, deleteTimeLog);

module.exports = router;