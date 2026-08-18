import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get all comments on a project (oldest first, like a Q&A thread)
// @route   GET /api/projects/:id/comments
// @access  Private
export const getProjectComments = async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.id })
      .populate('author', 'fullName username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    console.error('Get project comments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment/question to a project
// @route   POST /api/projects/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const project = await Project.findById(req.params.id).select('createdBy title');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const comment = await Comment.create({
      project: project._id,
      author: req.user._id,
      text: text.trim(),
    });

    // Let the owner know someone asked/commented, unless they commented on their own project.
    if (project.createdBy.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: project.createdBy,
        sender: req.user._id,
        type: 'project_comment',
        project: project._id,
        message: `${req.user.fullName} commented on "${project.title}"`,
      });
    }

    const populated = await comment.populate('author', 'fullName username profilePicture');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment (comment author or project owner only)
// @route   DELETE /api/projects/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.project.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const project = await Project.findById(req.params.id).select('createdBy');
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isProjectOwnerUser = project && project.createdBy.toString() === req.user._id.toString();

    if (!isAuthor && !isProjectOwnerUser) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: error.message });
  }
};
