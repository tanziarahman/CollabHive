import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getUserProjects,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Private routes (require authentication)
router.post('/', protect, createProject);
router.get('/user/my-projects', protect, getUserProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

export default router;