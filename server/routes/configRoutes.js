import express from 'express';
import { getProjectConfig } from '../controllers/configController.js';

const router = express.Router();

router.get('/project-config', getProjectConfig);

export default router;