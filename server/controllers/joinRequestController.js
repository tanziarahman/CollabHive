import Project from '../models/Project.js';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import { createNotification } from '../services/notificationService.js';

const roleExists = (project, role) =>
  project.roleAllocations.some((allocation) => allocation.role === role);

const roleHasCapacity = (project, role) => {
  const allocation = project.roleAllocations.find((r) => r.role === role);
  if (!allocation) return false;
  const filled = project.members.filter((m) => m.role === role).length;
  return filled < allocation.count;
};

const isAlreadyMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

// Only the receiving party of a join request may accept/reject it:
// project owner for a 'request', the invited applicant for an 'invite'.
const canRespond = (joinRequest, project, userId) => {
  if (joinRequest.type === 'request') {
    return project.createdBy.toString() === userId.toString();
  }
  return joinRequest.applicant.toString() === userId.toString();
};

// @desc    Request to join a project
// @route   POST /api/projects/:id/join-requests
// @access  Private
export const createJoinRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request to join your own project' });
    }

    const { role, message } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Please specify a role' });
    }
    if (!roleExists(project, role)) {
      return res.status(400).json({ message: 'That role is not open on this project' });
    }
    if (isAlreadyMember(project, req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    const existing = await JoinRequest.findOne({
      project: project._id,
      applicant: req.user._id,
      type: 'request',
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this project' });
    }

    const joinRequest = await JoinRequest.create({
      project: project._id,
      applicant: req.user._id,
      initiatedBy: req.user._id,
      type: 'request',
      role,
      message: message || '',
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { joinRequestsSent: joinRequest._id } });

    await createNotification({
      recipient: project.createdBy,
      sender: req.user._id,
      type: 'join_request',
      project: project._id,
      relatedJoinRequest: joinRequest._id,
      message: `${req.user.fullName} requested to join your project "${project.title}"`,
    });

    res.status(201).json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Create join request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite a user to join a project
// @route   POST /api/projects/:id/invite
// @access  Private (only project creator)
export const inviteUser = async (req, res) => {
  try {
    const project = req.project; // set by isProjectOwner middleware
    const { userId, role, message } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'Please provide userId and role' });
    }
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot invite yourself' });
    }
    if (!roleExists(project, role)) {
      return res.status(400).json({ message: 'That role is not open on this project' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (isAlreadyMember(project, userId)) {
      return res.status(400).json({ message: 'That user is already a member of this project' });
    }

    const existing = await JoinRequest.findOne({
      project: project._id,
      applicant: userId,
      type: 'invite',
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'That user already has a pending invite for this project' });
    }

    const joinRequest = await JoinRequest.create({
      project: project._id,
      applicant: userId,
      initiatedBy: req.user._id,
      type: 'invite',
      role,
      message: message || '',
    });

    await createNotification({
      recipient: userId,
      sender: req.user._id,
      type: 'invite',
      project: project._id,
      relatedJoinRequest: joinRequest._id,
      message: `${req.user.fullName} invited you to join "${project.title}" as ${role}`,
    });

    res.status(201).json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all join requests/invites for a project
// @route   GET /api/projects/:id/join-requests
// @access  Private (only project creator)
export const getProjectJoinRequests = async (req, res) => {
  try {
    const joinRequests = await JoinRequest.find({ project: req.project._id })
      .populate('applicant', 'fullName username profilePicture skills experienceLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: joinRequests.length, data: joinRequests });
  } catch (error) {
    console.error('Get project join requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the logged-in user's own join requests (sent) and invites (received)
// @route   GET /api/join-requests/me
// @access  Private
export const getMyJoinRequests = async (req, res) => {
  try {
    const joinRequests = await JoinRequest.find({ applicant: req.user._id })
      .populate('project', 'title category')
      .populate('initiatedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: joinRequests.length, data: joinRequests });
  } catch (error) {
    console.error('Get my join requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a join request or invite
// @route   PATCH /api/join-requests/:id/accept
// @access  Private (project owner for a 'request', applicant for an 'invite')
export const acceptJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }

    const project = await Project.findById(joinRequest.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!canRespond(joinRequest, project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    if (isAlreadyMember(project, joinRequest.applicant)) {
      return res.status(400).json({ message: 'That user is already a member of this project' });
    }
    if (!roleHasCapacity(project, joinRequest.role)) {
      return res.status(400).json({ message: 'This role is already full' });
    }

    project.members.push({ user: joinRequest.applicant, role: joinRequest.role });
    await project.save();

    await User.findByIdAndUpdate(joinRequest.applicant, { $push: { projectsJoined: project._id } });

    joinRequest.status = 'accepted';
    await joinRequest.save();

    if (joinRequest.type === 'request') {
      await createNotification({
        recipient: joinRequest.applicant,
        sender: req.user._id,
        type: 'request_accepted',
        project: project._id,
        relatedJoinRequest: joinRequest._id,
        message: `Your request to join "${project.title}" was accepted`,
      });
    } else {
      await createNotification({
        recipient: joinRequest.initiatedBy,
        sender: req.user._id,
        type: 'invite_accepted',
        project: project._id,
        relatedJoinRequest: joinRequest._id,
        message: `${req.user.fullName} accepted your invite to join "${project.title}"`,
      });
    }

    res.status(200).json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Accept join request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a join request or invite
// @route   PATCH /api/join-requests/:id/reject
// @access  Private (project owner for a 'request', applicant for an 'invite')
export const rejectJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }

    const project = await Project.findById(joinRequest.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!canRespond(joinRequest, project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    joinRequest.status = 'rejected';
    await joinRequest.save();

    if (joinRequest.type === 'request') {
      await createNotification({
        recipient: joinRequest.applicant,
        sender: req.user._id,
        type: 'request_rejected',
        project: project._id,
        relatedJoinRequest: joinRequest._id,
        message: `Your request to join "${project.title}" was declined`,
      });
    } else {
      await createNotification({
        recipient: joinRequest.initiatedBy,
        sender: req.user._id,
        type: 'invite_rejected',
        project: project._id,
        relatedJoinRequest: joinRequest._id,
        message: `${req.user.fullName} declined your invite to join "${project.title}"`,
      });
    }

    res.status(200).json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Reject join request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a pending join request or invite
// @route   DELETE /api/join-requests/:id
// @access  Private (only whoever initiated it)
export const cancelJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    if (joinRequest.initiatedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }

    joinRequest.status = 'cancelled';
    await joinRequest.save();

    res.status(200).json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Cancel join request error:', error);
    res.status(500).json({ message: error.message });
  }
};
