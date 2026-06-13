import Project from '../models/Project.js';

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
    });

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
      .populate('createdBy', 'fullName username profilePicture email');
    
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

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (only project creator)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
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
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
};