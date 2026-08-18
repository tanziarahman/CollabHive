import Project from '../models/Project.js';
import User from '../models/User.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skillsRequired,
      techStack,
      roleAllocations,
      duration,
      commitmentLevel,
      githubRepo,
      demoLink,
    } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Please provide title, description, and category' 
      });
    }

    if (!skillsRequired || skillsRequired.length === 0) {
      return res.status(400).json({ 
        message: 'Please select at least one required skill' 
      });
    }

    if (!roleAllocations || roleAllocations.length === 0) {
      return res.status(400).json({ 
        message: 'Please specify at least one role' 
      });
    }

    // Embed required skills + tech stack for skill-matching suggestions.
    // This is a nice-to-have (powers "recommended collaborators"), not a
    // requirement to publish — if it fails (e.g. no Gemini API key configured),
    // the project should still be created with an empty embedding rather than
    // blocking publishing entirely.
    const embeddingText = [...skillsRequired, ...(techStack || [])].join(', ');
    let skillsEmbedding = [];
    try {
      skillsEmbedding = await generateEmbedding(embeddingText);
    } catch (embeddingError) {
      console.warn('Skill-embedding generation failed, continuing without it:', embeddingError.message);
    }

    // Create project
    const project = await Project.create({
      title,
      description,
      category,
      skillsRequired,
      techStack: techStack || [],
      roleAllocations,
      duration: duration || '3-6 months',
      commitmentLevel: commitmentLevel || 'Flexible (As needed)',
      githubRepo: githubRepo || '',
      demoLink: demoLink || '',
      createdBy: req.user._id,  // From auth middleware
      skillsEmbedding,
    });

    // Notify followers so a new project shows up in their notifications/feed
    await Promise.all(
      (req.user.followers || []).map((followerId) =>
        createNotification({
          recipient: followerId,
          sender: req.user._id,
          type: 'new_project',
          project: project._id,
          message: `${req.user.fullName} posted a new project: "${project.title}"`,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create project' 
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'fullName username profilePicture')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'fullName username profilePicture email')
      .populate('members.user', 'fullName username profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get projects posted by users the logged-in user follows
// @route   GET /api/projects/feed
// @access  Private
export const getProjectFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('following +skillsEmbedding');

    const projects = await Project.find({ createdBy: { $in: me.following } })
      .populate('createdBy', 'fullName username profilePicture')
      .select('+skillsEmbedding')
      .sort({ createdAt: -1 });

    const data = projects.map((project) => ({
      _id: project._id,
      title: project.title,
      description: project.description,
      category: project.category,
      skillsRequired: project.skillsRequired,
      techStack: project.techStack,
      roleAllocations: project.roleAllocations,
      duration: project.duration,
      commitmentLevel: project.commitmentLevel,
      githubRepo: project.githubRepo,
      demoLink: project.demoLink,
      createdAt: project.createdAt,
      createdBy: project.createdBy,
      members: project.members,
      matchScore: cosineSimilarity(me.skillsEmbedding, project.skillsEmbedding),
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Get project feed error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get projects created by logged in user
// @route   GET /api/projects/user/my-projects
// @access  Private
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get every project the logged-in user is involved in (created or joined as a member),
//          with collaborator info for display (e.g. the Profile page's Projects tab)
// @route   GET /api/projects/collaborations
// @access  Private
export const getMyCollaborations = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('createdBy', 'fullName username profilePicture')
      .populate('members.user', 'fullName username profilePicture')
      .sort({ createdAt: -1 });

    const data = projects.map((project) => {
      const collaboratorsById = new Map();
      if (project.createdBy) {
        collaboratorsById.set(project.createdBy._id.toString(), {
          _id: project.createdBy._id,
          fullName: project.createdBy.fullName,
          profilePicture: project.createdBy.profilePicture,
        });
      }
      project.members.forEach((m) => {
        if (m.user) {
          collaboratorsById.set(m.user._id.toString(), {
            _id: m.user._id,
            fullName: m.user.fullName,
            profilePicture: m.user.profilePicture,
          });
        }
      });

      return {
        _id: project._id,
        title: project.title,
        category: project.category,
        description: project.description,
        githubRepo: project.githubRepo,
        demoLink: project.demoLink,
        roleAllocations: project.roleAllocations,
        skillsRequired: project.skillsRequired,
        techStack: project.techStack,
        isOwner: project.createdBy && project.createdBy._id.toString() === req.user._id.toString(),
        collaborators: Array.from(collaboratorsById.values()),
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Get my collaborations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (only project creator)
export const updateProject = async (req, res) => {
  try {
    // req.project is loaded + ownership-checked by isProjectOwner middleware
    const project = req.project;

    const {
      title,
      description,
      category,
      skillsRequired,
      techStack,
      roleAllocations,
      duration,
      commitmentLevel,
      githubRepo,
      demoLink,
    } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (category !== undefined) project.category = category;
    if (skillsRequired !== undefined) project.skillsRequired = skillsRequired;
    if (techStack !== undefined) project.techStack = techStack;
    if (roleAllocations !== undefined) project.roleAllocations = roleAllocations;
    if (duration !== undefined) project.duration = duration;
    if (commitmentLevel !== undefined) project.commitmentLevel = commitmentLevel;
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    if (demoLink !== undefined) project.demoLink = demoLink;

    // Regenerate skill-match embedding if the underlying skills changed.
    // Same as on create: this shouldn't block saving the rest of the update.
    if (skillsRequired !== undefined || techStack !== undefined) {
      const embeddingText = [...project.skillsRequired, ...project.techStack].join(', ');
      try {
        project.skillsEmbedding = await generateEmbedding(embeddingText);
      } catch (embeddingError) {
        console.warn('Skill-embedding generation failed, keeping previous embedding:', embeddingError.message);
      }
    }

    // .save() (rather than findByIdAndUpdate) so the pre('save') hook recalculates totalMembers
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (only project creator)
export const deleteProject = async (req, res) => {
  try {
    // req.project is loaded + ownership-checked by isProjectOwner middleware
    await req.project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get suggested collaborators for a project, ranked by skill match
// @route   GET /api/projects/:id/suggestions
// @access  Private (only project creator)
export const getSuggestedCollaborators = async (req, res) => {
  try {
    // req.project is loaded + ownership-checked by isProjectOwner middleware
    const project = await Project.findById(req.project._id).select('+skillsEmbedding');

    if (!project.skillsEmbedding || project.skillsEmbedding.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const excludeIds = [req.user._id.toString(), ...project.members.map((m) => m.user.toString())];

    const candidates = await User.find({
      _id: { $nin: excludeIds },
      'settings.discoverable': { $ne: false },
    })
      .select('fullName username profilePicture bio skills interests experienceLevel +skillsEmbedding');

    const suggestions = candidates
      .map((candidate) => ({
        user: {
          _id: candidate._id,
          fullName: candidate.fullName,
          username: candidate.username,
          profilePicture: candidate.profilePicture,
          bio: candidate.bio,
          skills: candidate.skills,
          interests: candidate.interests,
          experienceLevel: candidate.experienceLevel,
        },
        matchScore: cosineSimilarity(project.skillsEmbedding, candidate.skillsEmbedding),
      }))
      .filter((suggestion) => suggestion.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    console.error('Get suggested collaborators error:', error);
    res.status(500).json({ message: error.message });
  }
};