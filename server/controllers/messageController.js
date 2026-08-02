import Message from '../models/Message.js';

// @desc    Get message history for a project
// @route   GET /api/projects/:id/messages
// @access  Private (project owner or member)
export const getProjectMessages = async (req, res) => {
  try {
    const messages = await Message.find({ project: req.project._id })
      .populate('sender', 'fullName username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Get project messages error:', error);
    res.status(500).json({ message: error.message });
  }
};
