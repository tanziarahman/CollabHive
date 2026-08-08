import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getSettings,
  updateSettings,
  updateAccount,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.put('/account', protect, updateAccount);
router.put('/password', protect, changePassword);
router.post('/deactivate', protect, deactivateAccount);
router.delete('/', protect, deleteAccount);

export default router;
