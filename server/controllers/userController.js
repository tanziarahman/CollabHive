import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const publicFields = 'fullName username profilePicture skills interests bio experienceLevel availability';

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
