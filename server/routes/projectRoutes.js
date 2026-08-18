import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getProjectFeed,
  getUserProjects,
  getMyCollaborations,
  updateProject,
  deleteProject,
  getSuggestedCollaborators,
  getSimilarProjects,
} from '../controllers/projectController.js';
import {
  createJoinRequest,
  inviteUser,
  getProjectJoinRequests,
} from '../controllers/joinRequestController.js';
import { getProjectMessages } from '../controllers/messageController.js';
import {
  getProjectComments,
  addComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.js';
import { isProjectParticipant } from '../middleware/isProjectParticipant.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);

// Private routes (require authentication)
router.post('/', protect, createProject);
router.get('/feed', protect, getProjectFeed);
router.get('/user/my-projects', protect, getUserProjects);
router.get('/collaborations', protect, getMyCollaborations);

// Public route with a param — must come after '/feed' and other literal paths
router.get('/:id', getProjectById);
router.put('/:id', protect, isProjectOwner, updateProject);
router.delete('/:id', protect, isProjectOwner, deleteProject);
router.get('/:id/suggestions', protect, isProjectOwner, getSuggestedCollaborators);
router.post('/:id/join-requests', protect, createJoinRequest);
router.get('/:id/join-requests', protect, isProjectOwner, getProjectJoinRequests);
router.post('/:id/invite', protect, isProjectOwner, inviteUser);
router.get('/:id/messages', protect, isProjectParticipant, getProjectMessages);
router.get('/:id/similar', getSimilarProjects);
router.get('/:id/comments', protect, getProjectComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;