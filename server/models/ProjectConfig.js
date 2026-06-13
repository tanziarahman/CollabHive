import mongoose from 'mongoose';

const projectConfigSchema = new mongoose.Schema({
  categories: {
    type: [String],
    default: [
      'Web Application',
      'Mobile Application',
      'AI / Machine Learning',
      'Game Development',
      'Blockchain / Web3',
      'DevOps / Cloud',
      'Desktop Application',
      'Other',
    ],
  },
  skillsRequired: {
    type: [String],
    default: [
      'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
      'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Go',
      'TypeScript', 'JavaScript', 'Tailwind CSS', 'SASS', 'Bootstrap',
    ],
  },
  techStack: {
    type: [String],
    default: [
      'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase', 'Redis',
      'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Git',
      'GitHub Actions', 'Jenkins', 'Figma', 'Adobe XD',
    ],
  },
  roles: {
    type: [String],
    default: [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'UI/UX Designer', 'Product Manager', 'DevOps Engineer',
      'QA Engineer', 'Data Scientist', 'Mobile Developer', 'Technical Writer',
      'Project Manager', 'Security Engineer',
    ],
  },
  durations: {
    type: [String],
    default: [
      'Less than 1 month',
      '1-3 months',
      '3-6 months',
      '6-12 months',
      '12+ months',
    ],
  },
  commitmentLevels: {
    type: [String],
    default: [
      'Part-time (5-10 hrs/week)',
      'Full-time (20+ hrs/week)',
      'Flexible (As needed)',
    ],
  },
}, {
  timestamps: true,
});

const ProjectConfig = mongoose.model('ProjectConfig', projectConfigSchema);
export default ProjectConfig;