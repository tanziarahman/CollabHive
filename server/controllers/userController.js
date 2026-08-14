import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Project from '../models/Project.js';
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
    availability,
    profilePicture,
  } = req.body;

  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (portfolioURL !== undefined) user.portfolioURL = portfolioURL;
  if (githubURL !== undefined) user.githubURL = githubURL;
  if (linkedinURL !== undefined) user.linkedinURL = linkedinURL;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
  if (availability !== undefined) user.availability = availability;

  if (profilePicture !== undefined) {
    if (profilePicture !== '' && !/^data:image\/(png|jpe?g|gif|webp);base64,/.test(profilePicture)) {
      res.status(400);
      throw new Error('Profile picture must be a valid image file');
    }
    if (profilePicture.length > 4 * 1024 * 1024) {
      res.status(400);
      throw new Error('Profile picture is too large (max ~3MB)');
    }
    user.profilePicture = profilePicture;
  }

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

// @desc    Search users — either by name/username (general people search) or by
//          skill (for inviting collaborators to a project)
// @route   GET /api/users/search
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { skills, excludeProjectId, query } = req.query;
  const skillsList = (skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const excludeIds = [req.user._id.toString()];
  if (excludeProjectId) {
    const project = await Project.findById(excludeProjectId).select('members createdBy');
    if (project) {
      excludeIds.push(project.createdBy.toString());
      project.members.forEach((m) => excludeIds.push(m.user.toString()));
    }
  }

  const mongoQuery = {
    _id: { $nin: excludeIds },
    'settings.discoverable': { $ne: false },
  };

  const trimmedQuery = (query || '').trim();
  if (trimmedQuery) {
    const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    mongoQuery.$or = [{ fullName: regex }, { username: regex }];
  } else if (skillsList.length > 0) {
    mongoQuery.skills = { $in: skillsList };
  }

  const users = await User.find(mongoQuery)
    .select('fullName username profilePicture skills experienceLevel')
    .limit(20);

  const me = await User.findById(req.user._id).select(
    'following followRequestsSent followRequestsReceived'
  );

  const results = users.map((u) => {
    const idStr = u._id.toString();
    let relationship = 'none';
    if (me.following.some((id) => id.toString() === idStr)) relationship = 'following';
    else if (me.followRequestsSent.some((id) => id.toString() === idStr)) relationship = 'requested';
    else if (me.followRequestsReceived.some((id) => id.toString() === idStr)) relationship = 'incoming';

    return {
      _id: u._id,
      fullName: u.fullName,
      username: u.username,
      profilePicture: u.profilePicture,
      skills: u.skills,
      experienceLevel: u.experienceLevel,
      relationship,
      matchingSkills: skillsList.length ? u.skills.filter((s) => skillsList.includes(s)) : [],
    };
  });

  res.json(results);
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).select('following followRequestsReceived followRequestsSent');
  const excluded = [
    req.user._id,
    ...me.following,
    ...me.followRequestsReceived,
    ...me.followRequestsSent,
  ];

  const suggestions = await User.find({
    _id: { $nin: excluded },
    'settings.discoverable': { $ne: false },
  })
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

  if (alreadyConnected || requestExists) {
    res.json({ message: alreadyConnected ? 'Already following this user' : 'Follow request sent' });
    return;
  }

  // Skip the pending-request step entirely if the target has opted into auto-accepting.
  if (target.settings?.autoAcceptFollowRequests) {
    target.followers.addToSet(req.user._id);
    await target.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });

    await createNotification({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow_accepted',
      message: `${req.user.fullName} started following you`,
    });

    res.json({ message: 'You are now following this user' });
    return;
  }

  target.followRequestsReceived.push(req.user._id);
  await target.save();
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { followRequestsSent: target._id } });

  await createNotification({
    recipient: target._id,
    sender: req.user._id,
    type: 'follow_request',
    message: `${req.user.fullName} wants to follow you`,
  });

  res.json({ message: 'Follow request sent' });
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
