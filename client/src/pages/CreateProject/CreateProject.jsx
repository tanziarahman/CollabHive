import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getProjectConfig } from "../../api/config";
import { createProject } from "../../api/projects";
import "./CreateProject.css";

// Broad, multi-discipline category list — projects and competitions can come
// from any field, not just software/CS, so this isn't limited to tech.
const CATEGORY_OPTIONS = [
  "Software / App Development",
  "Web Development",
  "AI / Machine Learning",
  "Data Science & Analytics",
  "Hackathon",
  "Case Competition",
  "Robotics & Hardware",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering & Architecture",
  "Business & Entrepreneurship",
  "Design (UI/UX, Graphics, Product)",
  "Research & Academic Project",
  "Marketing & Media",
  "Finance & Economics",
  "Science & Innovation Fair",
  "Other",
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 4;

  // Only "durations" still comes from the backend config — categories, skills,
  // tech stack and roles used to be CS-only preset lists pulled from there, so
  // those are now defined/entered on the frontend instead.
  const [config, setConfig] = useState({
    durations: [],
  });

  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    category: "",

    // Team Requirements
    skillsRequired: [],
    techStack: [],
    roleAllocations: [],

    // Additional Info
    duration: "",

    // Links
    githubRepo: "",
    demoLink: "",
  });

  // Manual-entry drafts
  const [skillDraft, setSkillDraft] = useState("");
  const [techDraft, setTechDraft] = useState("");
  const [roleNameDraft, setRoleNameDraft] = useState("");

  // Fetch config from backend once when the page loads
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getProjectConfig();
        setConfig((prev) => ({ ...prev, durations: data.durations || [] }));
      } catch {
        // Duration presets are a nice-to-have; the form still works without them.
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Scroll to top whenever the wizard moves to a new section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getTotalMembers = () => {
    return formData.roleAllocations.reduce((total, role) => total + role.count, 0);
  };

  // Manual skill / tech stack entry (replaces the old CS-only preset buttons)
  const addTagValue = (field, draft, setDraft) => {
    const value = draft.trim();
    if (!value) return;
    setFormData((prev) => {
      if (prev[field].some((v) => v.toLowerCase() === value.toLowerCase())) return prev;
      return { ...prev, [field]: [...prev[field], value] };
    });
    setDraft("");
  };

  const removeTagValue = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Manual, multi-discipline team structure (replaces the old CS-only role list)
  const addRole = () => {
    const roleName = roleNameDraft.trim();
    if (!roleName) return;
    setFormData((prev) => {
      if (prev.roleAllocations.some((r) => r.role.toLowerCase() === roleName.toLowerCase())) {
        return prev;
      }
      return { ...prev, roleAllocations: [...prev.roleAllocations, { role: roleName, count: 1 }] };
    });
    setRoleNameDraft("");
  };

  const removeRole = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      roleAllocations: prev.roleAllocations.filter((r) => r.role !== roleName),
    }));
  };

  const changeRoleCount = (roleName, delta) => {
    setFormData((prev) => ({
      ...prev,
      roleAllocations: prev.roleAllocations
        .map((r) =>
          r.role === roleName ? { ...r, count: Math.min(10, Math.max(1, r.count + delta)) } : r
        ),
    }));
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
      setCurrentSection(prev => {
        return Math.min(prev + 1, totalSections);
      });
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
    setError("");

    try {
      await createProject({
        ...formData,
        totalMembers: getTotalMembers()
      });
      navigate("/my-posts");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  // Show loading state while fetching config
  if (configLoading) {
    return (
      <div className="create-project-page">
        <Navbar hideSearch />
        <div className="create-project-container">
          <div className="loading-state">Loading project configuration...</div>
        </div>
      </div>
    );
  }

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
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="hint">Covers projects and competitions across any field, not just software</span>
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
              <div className="manual-tag-input">
                <input
                  type="text"
                  placeholder="Type a skill, e.g. React, CAD design, Financial modeling..."
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagValue("skillsRequired", skillDraft, setSkillDraft);
                    }
                  }}
                />
                <button
                  type="button"
                  className="manual-tag-add"
                  onClick={() => addTagValue("skillsRequired", skillDraft, setSkillDraft)}
                >
                  Add
                </button>
              </div>
              <div className="tags-container">
                {formData.skillsRequired.map((skill, i) => (
                  <span className="manual-tag-chip" key={`${skill}-${i}`}>
                    {skill}
                    <button type="button" aria-label={`Remove ${skill}`} onClick={() => removeTagValue("skillsRequired", i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <span className="hint">Type any skill relevant to your field and press Add — not limited to tech</span>
            </div>

            <div className="form-group">
              <label>Tech Stack & Tools</label>
              <div className="manual-tag-input">
                <input
                  type="text"
                  placeholder="Type a tool or technology, e.g. Figma, SolidWorks, Excel..."
                  value={techDraft}
                  onChange={(e) => setTechDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagValue("techStack", techDraft, setTechDraft);
                    }
                  }}
                />
                <button
                  type="button"
                  className="manual-tag-add"
                  onClick={() => addTagValue("techStack", techDraft, setTechDraft)}
                >
                  Add
                </button>
              </div>
              <div className="tags-container">
                {formData.techStack.map((tech, i) => (
                  <span className="manual-tag-chip" key={`${tech}-${i}`}>
                    {tech}
                    <button type="button" aria-label={`Remove ${tech}`} onClick={() => removeTagValue("techStack", i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Team Structure <span className="required">*</span></label>
              <div className="manual-tag-input">
                <input
                  type="text"
                  placeholder="Type a role, e.g. Backend Developer, Mechanical Lead, Marketing Strategist..."
                  value={roleNameDraft}
                  onChange={(e) => setRoleNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRole();
                    }
                  }}
                />
                <button type="button" className="manual-tag-add" onClick={addRole}>
                  Add Role
                </button>
              </div>

              {formData.roleAllocations.length > 0 && (
                <div className="role-allocations">
                  <div className="role-allocations-header">
                    <span>Role</span>
                    <span>Number Needed</span>
                  </div>
                  <div className="role-list">
                    {formData.roleAllocations.map(({ role, count }) => (
                      <div key={role} className="role-item">
                        <span className="role-name">{role}</span>
                        <div className="role-item-actions">
                          <div className="role-counter">
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() => changeRoleCount(role, -1)}
                              disabled={count <= 1}
                            >
                              −
                            </button>
                            <span className="role-count">{count}</span>
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() => changeRoleCount(role, 1)}
                              disabled={count >= 10}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="role-remove-btn"
                            aria-label={`Remove ${role}`}
                            onClick={() => removeRole(role)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <span className="hint">Add any role your project or competition needs, across any discipline (max 10 per role)</span>
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
                  {config.durations.map(dur => (
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
      <Navbar hideSearch />

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
              <button
                key="continue-btn"
                type="button"
                className="btn-primary"
                onClick={nextSection}
              >
                Continue →
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Creating Project..." : "Publish Project →"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}