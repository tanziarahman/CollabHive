import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { createNotification } from '../services/notificationService.js';

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

const PUBLIC_PROFILE_FIELDS = 'fullName username profilePicture bio skills experienceLevel';

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const currentUser = await User.findById(req.user._id);
  const alreadyFollowing = currentUser.following.some((id) => id.toString() === targetId);
  if (alreadyFollowing) {
    res.status(400);
    throw new Error('You are already following this user');
  }

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });

  await createNotification({
    recipient: targetId,
    sender: req.user._id,
    type: 'new_follower',
    message: `${req.user.fullName} started following you`,
  });

  res.status(200).json({ success: true, message: 'User followed successfully' });
});

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  const currentUser = await User.findById(req.user._id);
  const isFollowing = currentUser.following.some((id) => id.toString() === targetId);
  if (!isFollowing) {
    res.status(400);
    throw new Error('You are not following this user');
  }

  await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });

  res.status(200).json({ success: true, message: 'User unfollowed successfully' });
});

// @desc    Get a user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', PUBLIC_PROFILE_FIELDS);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, count: user.followers.length, data: user.followers });
});

// @desc    Get who a user is following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', PUBLIC_PROFILE_FIELDS);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, count: user.following.length, data: user.following });
});
