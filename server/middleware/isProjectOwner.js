import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';

// Loads the project onto req.project and ensures req.user is its creator.
// Must run after `protect`.
export const isProjectOwner = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to perform this action on this project');
  }

  req.project = project;
  next();
});
