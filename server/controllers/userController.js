import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { createNotification } from '../services/notificationService.js';

const publicFields = 'fullName username profilePicture skills interests bio experienceLevel availability';

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

export const getSuggestions = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).select('following followRequestsReceived followRequestsSent');
  const excluded = [
    req.user._id,
    ...me.following,
    ...me.followRequestsReceived,
    ...me.followRequestsSent,
  ];

  const suggestions = await User.find({ _id: { $nin: excluded } })
    .select(publicFields)
    .limit(6);
  res.json(suggestions);
});

export const sendFollowRequest = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }
  if (target._id.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const alreadyConnected = target.followers.some((id) => id.equals(req.user._id));
  const requestExists = target.followRequestsReceived.some((id) => id.equals(req.user._id));
  if (!alreadyConnected && !requestExists) {
    target.followRequestsReceived.push(req.user._id);
    await target.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { followRequestsSent: target._id } });

    await createNotification({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow_request',
      message: `${req.user.fullName} wants to follow you`,
    });
  }
  res.json({ message: alreadyConnected ? 'Already following this user' : 'Follow request sent' });
});

export const getFollowRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followRequestsReceived', publicFields);
  res.json(user.followRequestsReceived || []);
});

export const getMyConnections = asyncHandler(async (req, res) => {
  const field = req.params.type === 'followers' ? 'followers' : 'following';
  const user = await User.findById(req.user._id).populate(field, publicFields);
  res.json(user[field] || []);
});

export const respondToFollowRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.userId;
  const accept = req.body.action === 'accept';
  const user = await User.findById(req.user._id);
  const hasRequest = user.followRequestsReceived.some((id) => id.equals(requesterId));
  if (!hasRequest) {
    res.status(404);
    throw new Error('Follow request not found');
  }

  user.followRequestsReceived.pull(requesterId);
  if (accept) user.followers.addToSet(requesterId);
  await user.save();

  const requester = await User.findById(requesterId);
  requester.followRequestsSent.pull(req.user._id);
  if (accept) requester.following.addToSet(req.user._id);
  await requester.save();

  if (accept) {
    await createNotification({
      recipient: requesterId,
      sender: req.user._id,
      type: 'follow_accepted',
      message: `${req.user.fullName} accepted your follow request`,
    });
  }

  res.json({ message: accept ? 'Follow request accepted' : 'Follow request declined' });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});
