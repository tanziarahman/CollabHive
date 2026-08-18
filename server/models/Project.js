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

    // Flexible list of named links/files (GitHub repo, live demo, docs, design
    // files, anything) — any number of resources, matching what the
    // create/edit project forms offer, rather than two fixed link fields.
    resources: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      url: {
        type: String,
        required: true,
      },
      isFile: {
        type: Boolean,
        default: false,
      },
      fileName: {
        type: String,
        default: '',
      },
    }],

    // Relations
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Users actually accepted onto the team (as opposed to roleAllocations, which is the target headcount)
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate total members before saving (without next)
projectSchema.pre('save', function() {
  if (this.roleAllocations && this.roleAllocations.length > 0) {
    this.totalMembers = this.roleAllocations.reduce((total, role) => total + role.count, 0);
  }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;