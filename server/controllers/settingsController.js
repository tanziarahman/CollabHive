import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Project from '../models/Project.js';
import JoinRequest from '../models/JoinRequest.js';
import Notification from '../models/Notification.js';

// @desc    Get logged-in user's account + settings info
// @route   GET /api/settings
// @access  Private
export const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('email username settings isDeactivated');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc    Update notification / privacy toggles
// @route   PUT /api/settings
// @access  Private
export const updateSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    notifyFollowRequests,
    notifyFollowAccepted,
    notifyJoinRequests,
    notifyJoinRequestUpdates,
    discoverable,
    autoAcceptFollowRequests,
  } = req.body;

  if (notifyFollowRequests !== undefined) user.settings.notifyFollowRequests = notifyFollowRequests;
  if (notifyFollowAccepted !== undefined) user.settings.notifyFollowAccepted = notifyFollowAccepted;
  if (notifyJoinRequests !== undefined) user.settings.notifyJoinRequests = notifyJoinRequests;
  if (notifyJoinRequestUpdates !== undefined) user.settings.notifyJoinRequestUpdates = notifyJoinRequestUpdates;
  if (discoverable !== undefined) user.settings.discoverable = discoverable;
  if (autoAcceptFollowRequests !== undefined) user.settings.autoAcceptFollowRequests = autoAcceptFollowRequests;

  await user.save();
  res.json({ message: 'Settings updated', settings: user.settings });
});

// @desc    Update username / email
// @route   PUT /api/settings/account
// @access  Private
export const updateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { email, username } = req.body;

  if (email !== undefined) {
    const lowerEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(lowerEmail)) {
      res.status(400);
      throw new Error('Please enter a valid email');
    }
    if (lowerEmail !== user.email) {
      const exists = await User.findOne({ email: lowerEmail, _id: { $ne: user._id } });
      if (exists) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = lowerEmail;
    }
  }

  if (username !== undefined) {
    const lowerUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]+$/.test(lowerUsername)) {
      res.status(400);
      throw new Error('Username can only contain letters, numbers and underscores');
    }
    if (lowerUsername !== user.username) {
      const exists = await User.findOne({ username: lowerUsername, _id: { $ne: user._id } });
      if (exists) {
        res.status(400);
        throw new Error('Username already taken');
      }
      user.username = lowerUsername;
    }
  }

  await user.save();
  res.json({ message: 'Account updated', email: user.email, username: user.username });
});

// @desc    Change password
// @route   PUT /api/settings/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide your current and new password');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const matches = await user.matchPassword(currentPassword);
  if (!matches) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

// @desc    Deactivate account (soft). Logging back in reactivates it.
// @route   POST /api/settings/deactivate
// @access  Private
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isDeactivated = true;
  await user.save();
  res.json({ message: 'Account deactivated' });
});

// @desc    Permanently delete account and everything tied to it
// @route   DELETE /api/settings
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Please confirm your password to delete your account');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const matches = await user.matchPassword(password);
  if (!matches) {
    res.status(401);
    throw new Error('Password is incorrect');
  }

  const userId = user._id;

  // Strip this user out of everyone else's connections
  await User.updateMany(
    {},
    {
      $pull: {
        followers: userId,
        following: userId,
        followRequestsSent: userId,
        followRequestsReceived: userId,
      },
    }
  );

  // Remove them as a member from projects they joined but didn't create
  await Project.updateMany({}, { $pull: { members: { user: userId } } });

  // Delete projects they created, and everything tied to those projects
  const ownedProjects = await Project.find({ createdBy: userId }).select('_id');
  const ownedProjectIds = ownedProjects.map((p) => p._id);

  if (ownedProjectIds.length) {
    await JoinRequest.deleteMany({ project: { $in: ownedProjectIds } });
    await Notification.deleteMany({ project: { $in: ownedProjectIds } });
    await Project.deleteMany({ _id: { $in: ownedProjectIds } });
  }

  // Clean up anything left tied directly to this user
  await JoinRequest.deleteMany({ $or: [{ applicant: userId }, { initiatedBy: userId }] });
  await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });

  await User.findByIdAndDelete(userId);

  res.json({ message: 'Account deleted' });
});
