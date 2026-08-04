import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getSuggestions,
  sendFollowRequest,
  getFollowRequests,
  getMyConnections,
  respondToFollowRequest,
  getPublicProfile,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/suggestions', protect, getSuggestions);
router.get('/follow-requests', protect, getFollowRequests);
router.get('/connections/:type', protect, getMyConnections);
router.post('/:userId/follow-request', protect, sendFollowRequest);
router.patch('/follow-requests/:userId', protect, respondToFollowRequest);
router.get('/:userId/profile', protect, getPublicProfile);

export default router;
