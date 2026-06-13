import ProjectConfig from '../models/ProjectConfig.js';

// @desc    Get project configuration
// @route   GET /api/config/project-config
// @access  Public
export const getProjectConfig = async (req, res) => {
  try {
    let config = await ProjectConfig.findOne();
    
    // If no config exists, create default one
    if (!config) {
      config = await ProjectConfig.create({});
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
