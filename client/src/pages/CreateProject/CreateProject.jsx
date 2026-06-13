import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./CreateProject.css";

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 4;
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    category: "",
    
    // Team Requirements
    skillsRequired: [],
    techStack: [],
    roleAllocations: [], // [{ role: "Frontend Developer", count: 2 }]
    
    // Additional Info
    duration: "",
    commitmentLevel: "",
    
    // Links
    githubRepo: "",
    demoLink: "",
  });

  const categories = [
    "Web Application", "Mobile Application", "AI / Machine Learning", 
    "Game Development", "Blockchain / Web3", "DevOps / Cloud", 
    "Desktop Application", "Other"
  ];
  
  const availableSkills = [
    "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express.js",
    "Python", "Django", "FastAPI", "Java", "Spring Boot", "Go",
    "TypeScript", "JavaScript", "Tailwind CSS", "SASS", "Bootstrap"
  ];
  
  const availableTech = [
    "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase", "Redis",
    "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Git",
    "GitHub Actions", "Jenkins", "Figma", "Adobe XD"
  ];
  
  const availableRoles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "UI/UX Designer", "Product Manager", "DevOps Engineer",
    "QA Engineer", "Data Scientist", "Mobile Developer", "Technical Writer",
    "Project Manager", "Security Engineer"
  ];
  
  const durations = [
    "Less than 1 month", "1-3 months", "3-6 months", "6-12 months", "12+ months"
  ];
  
  const commitmentLevels = [
    "Part-time (5-10 hrs/week)",
    "Full-time (20+ hrs/week)",
    "Flexible (As needed)"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleRoleAllocation = (role, count) => {
    setFormData(prev => {
      const existingIndex = prev.roleAllocations.findIndex(r => r.role === role);
      const newAllocations = [...prev.roleAllocations];
      
      if (count <= 0) {
        // Remove role if count is 0
        if (existingIndex !== -1) {
          newAllocations.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex !== -1) {
          newAllocations[existingIndex] = { role, count };
        } else {
          newAllocations.push({ role, count });
        }
      }
      
      return { ...prev, roleAllocations: newAllocations };
    });
  };

  const getTotalMembers = () => {
    return formData.roleAllocations.reduce((total, role) => total + role.count, 0);
  };

  const validateSection = () => {
    switch(currentSection) {
      case 1:
        if (!formData.title.trim()) {
          setError("Project title is required");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Project description is required");
          return false;
        }
        if (!formData.category) {
          setError("Please select a category");
          return false;
        }
        break;
      case 2:
        if (formData.skillsRequired.length === 0) {
          setError("Please select at least one required skill");
          return false;
        }
        if (formData.roleAllocations.length === 0) {
          setError("Please specify at least one role and number of members needed");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextSection = () => {
    if (validateSection()) {
      setCurrentSection(prev => Math.min(prev + 1, totalSections));
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/post-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalMembers: getTotalMembers()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }
      
      navigate(`/project/${data._id}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch(currentSection) {
      case 1:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2>Basic Information</h2>
              <p>Tell the community about your project idea</p>
            </div>
            
            <div className="form-group">
              <label>Project Title <span className="required">*</span></label>
              <input
                type="text"
                name="title"
                placeholder="e.g., AI-Powered Task Management Platform"
                value={formData.title}
                onChange={handleChange}
              />
              <span className="hint">Choose a clear, descriptive title that attracts the right talent</span>
            </div>
            
            <div className="form-group">
              <label>Project Description <span className="required">*</span></label>
              <textarea
                name="description"
                placeholder="Describe your project vision, goals, technical approach, and what you're looking for in team members..."
                rows="6"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <span className="hint">Be specific about the problem you're solving and the technologies you plan to use</span>
            </div>
            
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2>Team Requirements</h2>
              <p>Define the roles and skills you're looking for</p>
            </div>
            
            <div className="form-group">
              <label>Required Skills <span className="required">*</span></label>
              <div className="tags-container">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`tag-btn ${formData.skillsRequired.includes(skill) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('skillsRequired', skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <span className="hint">Select all relevant technical skills needed for this project</span>
            </div>
            
            <div className="form-group">
              <label>Tech Stack & Tools</label>
              <div className="tags-container">
                {availableTech.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    className={`tag-btn ${formData.techStack.includes(tech) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('techStack', tech)}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Team Structure <span className="required">*</span></label>
              <div className="role-allocations">
                <div className="role-allocations-header">
                  <span>Role</span>
                  <span>Number Needed</span>
                </div>
                <div className="role-list">
                  {availableRoles.map(role => {
                    const allocation = formData.roleAllocations.find(r => r.role === role);
                    const count = allocation ? allocation.count : 0;
                    
                    return (
                      <div key={role} className="role-item">
                        <span className="role-name">{role}</span>
                        <div className="role-counter">
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => handleRoleAllocation(role, count - 1)}
                            disabled={count === 0}
                          >
                            −
                          </button>
                          <span className="role-count">{count}</span>
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => handleRoleAllocation(role, count + 1)}
                            disabled={count >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <span className="hint">Set how many people you need for each role (max 10 per role)</span>
              {formData.roleAllocations.length > 0 && (
                <div className="team-summary">
                  <strong>Total team members needed: {getTotalMembers()}</strong>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2>Project Timeline & Commitment</h2>
              <p>Set expectations for potential team members</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Expected Duration</label>
                <div className="radio-group">
                  {durations.map(dur => (
                    <label key={dur} className="radio-label">
                      <input
                        type="radio"
                        name="duration"
                        value={dur}
                        checked={formData.duration === dur}
                        onChange={handleChange}
                      />
                      <span>{dur}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Commitment Level</label>
              <div className="radio-group">
                {commitmentLevels.map(level => (
                  <label key={level} className="radio-label">
                    <input
                      type="radio"
                      name="commitmentLevel"
                      value={level}
                      checked={formData.commitmentLevel === level}
                      onChange={handleChange}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2>Links & Resources</h2>
              <p>Share any relevant links for your project</p>
            </div>
            
            <div className="form-group">
              <label>GitHub Repository</label>
              <input
                type="url"
                name="githubRepo"
                placeholder="https://github.com/username/project"
                value={formData.githubRepo}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Live Demo / Website</label>
              <input
                type="url"
                name="demoLink"
                placeholder="https://project-demo.com"
                value={formData.demoLink}
                onChange={handleChange}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="create-project-page">
      <Navbar />
      
      <div className="create-project-container">
        <div className="create-project-header">
          <h1>Launch a New Project</h1>
          <p>Find talented collaborators and bring your vision to life</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`step ${currentSection >= step ? 'active' : ''}`}>
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Requirements"}
                  {step === 3 && "Timeline"}
                  {step === 4 && "Links"}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-line" style={{ width: `${((currentSection - 1) / (totalSections - 1)) * 100}%` }}></div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {renderSection()}
          
          <div className="form-actions">
            {currentSection > 1 && (
              <button type="button" className="btn-secondary" onClick={prevSection}>
                ← Back
              </button>
            )}
            {currentSection < totalSections ? (
              <button type="button" className="btn-primary" onClick={nextSection}>
                Continue →
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating Project..." : "Publish Project →"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}