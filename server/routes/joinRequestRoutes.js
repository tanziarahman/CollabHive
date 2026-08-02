import express from 'express';
import {
  getMyJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
} from '../controllers/joinRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyJoinRequests);
router.patch('/:id/accept', protect, acceptJoinRequest);
router.patch('/:id/reject', protect, rejectJoinRequest);
router.delete('/:id', protect, cancelJoinRequest);

export default router;
