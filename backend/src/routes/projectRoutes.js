const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/projectController');

// Get project statistics (must be before /:id route)
router.get('/stats', protect, getProjectStats);

// Create a new project
router.post('/', protect, createProject);

// Get all projects for the authenticated user
router.get('/', protect, getProjects);

// Get a single project by ID
router.get('/:id', protect, getProjectById);

// Update a project by ID
router.put('/:id', protect, updateProject);

// Delete a project by ID
router.delete('/:id', protect, deleteProject);

module.exports = router;
