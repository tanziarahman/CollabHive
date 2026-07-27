import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getUserProjects,
  updateProject,
  deleteProject,
  getSuggestedCollaborators,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Private routes (require authentication)
router.post('/', protect, createProject);
router.get('/user/my-projects', protect, getUserProjects);
router.put('/:id', protect, isProjectOwner, updateProject);
router.delete('/:id', protect, isProjectOwner, deleteProject);
router.get('/:id/suggestions', protect, isProjectOwner, getSuggestedCollaborators);

export default router;