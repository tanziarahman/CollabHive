import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateEmbedding } from '../services/embeddingService.js';

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    bio,
    location,
    portfolioURL,
    githubURL,
    linkedinURL,
    skills,
    interests,
    experienceLevel,
  } = req.body;

  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (portfolioURL !== undefined) user.portfolioURL = portfolioURL;
  if (githubURL !== undefined) user.githubURL = githubURL;
  if (linkedinURL !== undefined) user.linkedinURL = linkedinURL;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;

  let skillsChanged = false;

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      res.status(400);
      throw new Error('skills must be an array of strings');
    }
    user.skills = skills;
    skillsChanged = true;
  }

  if (interests !== undefined) {
    if (!Array.isArray(interests)) {
      res.status(400);
      throw new Error('interests must be an array of strings');
    }
    user.interests = interests;
    skillsChanged = true;
  }

  if (skillsChanged) {
    const embeddingText = [...user.skills, ...user.interests].join(', ');
    user.skillsEmbedding = await generateEmbedding(embeddingText);
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select('-password');
  res.status(200).json(updatedUser);
});
