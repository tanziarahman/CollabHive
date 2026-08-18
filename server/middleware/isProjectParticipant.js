import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import { isProjectMember } from '../utils/projectAccess.js';

// Loads the project onto req.project and ensures req.user is its owner or an
// accepted member. Must run after `protect`.
export const isProjectParticipant = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!isProjectMember(project, req.user._id)) {
    res.status(403);
    throw new Error('Not authorized: you are not a member of this project');
  }

  req.project = project;
  next();
});
