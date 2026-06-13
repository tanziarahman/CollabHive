import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },

    // Team Requirements
    skillsRequired: [{
      type: String,
    }],
    
    techStack: [{
      type: String,
    }],
    
    roleAllocations: [{
      role: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    }],
    
    totalMembers: {
      type: Number,
      default: 0,
    },

    // Additional Info
    duration: {
      type: String,
      default: '3-6 months',
    },
    
    commitmentLevel: {
      type: String,
      default: 'Flexible (As needed)',
    },

    // Links
    githubRepo: {
      type: String,
      default: '',
    },
    demoLink: {
      type: String,
      default: '',
    },

    // Relations
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total members before saving
projectSchema.pre('save', function (next) {
  if (this.roleAllocations && this.roleAllocations.length > 0) {
    this.totalMembers = this.roleAllocations.reduce((total, role) => total + role.count, 0);
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;