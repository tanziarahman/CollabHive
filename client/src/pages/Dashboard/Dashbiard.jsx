import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [followingId, setFollowingId] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const [applyingProject, setApplyingProject] = useState(null);

  async function fetchDashboard() {
    try {
      const token = localStorage.getItem("token");

      const userResponse = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error();
      }

      const userData = await userResponse.json();
      setUser(userData);

      const projectResponse = await fetch(
        "http://localhost:5000/api/projects/recommended",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!projectResponse.ok) {
        throw new Error();
      }

      const projectData = await projectResponse.json();

      setProjects(projectData);
      const suggestionsResponse = await fetch(
        "http://localhost:5000/api/users/suggestions",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (suggestionsResponse.ok) setSuggestions(await suggestionsResponse.json());
      setError("");
    } catch {
      console.log("Backend unavailable. Loading demo projects...");

      setError("");

      setUser({
        name: "Tanzia Rahman",
        skills: ["React", "Node.js", "MongoDB", "Express"],
        techStack: ["JWT", "Git", "Docker"],
      });

      setProjects([
        {
          _id: "1",
          title: "CollabHive",
          creator: {
            name: "Ayesha Khan",
          },
          description:
            "CollabHive is a collaborative platform where students and developers can find teammates based on their skills, manage projects, and build their portfolios together. The platform includes intelligent project recommendations, role-based applications, and project tracking.",

          skillsRequired: ["React", "Node.js", "Express", "MongoDB"],

          techStack: ["React", "Express", "MongoDB", "JWT"],

          githubRepo: "https://github.com/example/collabhive",

          demoLink: "https://collabhive-demo.vercel.app",

          roleAllocations: [
            { role: "Frontend Developer", count: 2 },
            { role: "Backend Developer", count: 1 },
            { role: "UI/UX Designer", count: 1 },
          ],
        },

        {
          _id: "2",
          title: "AI Resume Analyzer",

          creator: {
            name: "Nafis Ahmed",
          },

          description:
            "An AI-powered resume analyzer that evaluates resumes against job descriptions, provides ATS scores, highlights missing skills, and generates suggestions for improvement using Large Language Models.",

          skillsRequired: ["Python", "React", "Machine Learning"],

          techStack: ["React", "FastAPI", "Python", "OpenAI API", "PostgreSQL"],

          demoLink: "https://resume-ai-demo.vercel.app",

          roleAllocations: [
            { role: "Machine Learning Engineer", count: 1 },
            { role: "Frontend Developer", count: 1 },
            { role: "Backend Developer", count: 2 },
          ],
        },
      ]);
      setSuggestions([
        { _id: "sarah-demo", fullName: "Sarah Jenkins", username: "sarahjenkins", skills: ["React", "TypeScript", "Tailwind"], experienceLevel: "Intermediate" },
        { _id: "david-demo", fullName: "David Chen", username: "davidchen", skills: ["Node.js", "PostgreSQL", "AWS"], experienceLevel: "Advanced" },
        { _id: "elena-demo", fullName: "Elena Rodriguez", username: "elenar", skills: ["Figma", "Design Systems", "Prototyping"], experienceLevel: "Intermediate" },
        { _id: "michael-demo", fullName: "Michael Brooks", username: "michaelb", skills: ["Python", "Django", "Docker"], experienceLevel: "Advanced" },
        { _id: "aisha-demo", fullName: "Aisha Rahman", username: "aishar", skills: ["UI/UX", "Figma", "Research"], experienceLevel: "Intermediate" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadDashboard = window.setTimeout(fetchDashboard, 0);
    return () => window.clearTimeout(loadDashboard);
  }, []); // fetchDashboard is intentionally run once when the page opens.

  const handleFollow = async (person) => {
    setFollowingId(person._id);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${person._id}/follow-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error();
    } catch {
      // Demo suggestions remain interactive without an active API.
    } finally {
      setSuggestions((items) => items.filter((item) => item._id !== person._id));
      setFollowingId(null);
    }
  };

  const toggleApply = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };

  const handleRoleChange = (projectId, role) => {
    setSelectedRole((prev) => ({
      ...prev,
      [projectId]: role,
    }));
  };

  const handleApply = async (projectId) => {
    const role = selectedRole[projectId];

    if (!role) {
      alert("Please select a role.");
      return;
    }

    try {
      setApplyingProject(projectId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectId,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Application submitted successfully.");

      setExpandedProject(null);
    } catch (err) {
      alert(err.message || "Application failed.");
    } finally {
      setApplyingProject(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="dashboard-container">
          <div className="loading-state">Loading projects...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="dashboard-container">
          <div className="error-message">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-container">
          {/* Hero Section */}

          <section className="dashboard-hero">
            <div className="hero-left">
              <h1>Welcome back{user?.fullName || user?.name ? `, ${user.fullName || user.name}` : ""} 👋</h1>

              <p>
                Discover projects that match your skills and start
                collaborating with other developers.
              </p>
            </div>
          </section>

          {suggestions.length > 0 && (
            <section className="suggestions-section" aria-labelledby="suggestions-heading">
              <div className="suggestions-heading">
                <div>
                  <p className="suggestions-eyebrow">Suggested connections</p>
                  <h2 id="suggestions-heading">People you might want to collaborate with</h2>
                </div>
                <button className="see-requests-link" onClick={() => navigate("/follow-requests")}>Follow requests</button>
              </div>
              <div className="suggestion-grid">
                {suggestions.map((person) => (
                  <article className="suggestion-card" key={person._id}>
                    <button className="suggestion-avatar" onClick={() => navigate(`/profile/${person._id}`)} aria-label={`View ${person.fullName}'s profile`}>
                      {person.profilePicture ? <img src={person.profilePicture} alt="" /> : person.fullName?.charAt(0)}
                    </button>
                    <p className="suggestion-role">{person.experienceLevel || "Community member"}</p>
                    <h3>{person.fullName}</h3>
                    <p className="suggestion-handle">@{person.username || "collabhive"}</p>
                    <div className="skill-panel"><span>Top skills</span><p>{(person.skills || []).slice(0, 3).join(" · ") || "Open to collaborate"}</p></div>
                    <div className="suggestion-actions">
                      <button className="view-profile-btn" onClick={() => navigate(`/profile/${person._id}`)}>View profile</button>
                      <button className="follow-btn" disabled={followingId === person._id} onClick={() => handleFollow(person)}>
                        {followingId === person._id ? "Sending..." : "Follow"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}

          {projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Matching Projects</h2>

              <p>Update your profile with more skills to discover projects.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div className="project-card" key={project._id}>
                  {/* Header */}

                  <div className="project-header">
                    <div>
                      <h2>{project.title}</h2>

                      <p className="creator">
                        Created by {project.creator?.name}
                      </p>
                    </div>

                    {project.category && (
                      <span className="category-badge">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {/* Description */}

                  <p className="project-description">{project.description}</p>

                  {/* Required Skills */}

                  <div className="info-section">
                    <h3>Required Skills</h3>

                    <div className="tag-container">
                      {(project.skillsRequired || []).map((skill) => (
                        <span className="tag" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}

                  <div className="info-section">
                    <h3>Tech Stack</h3>

                    <div className="tag-container">
                      {(project.techStack || []).map((tech) => (
                        <span className="tag tech-tag" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Open Roles */}

                  <div className="info-section">
                    <h3>Open Roles</h3>

                    <div className="roles-list">
                      {(project.roleAllocations || []).map((role) => (
                        <div className="role-card" key={role.role}>
                          <span>{role.role}</span>

                          <span className="role-count">
                            {role.count} Needed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}

                  <div className="project-footer">
                    <div className="resource-buttons">
                      {project.githubRepo && (
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-btn"
                        >
                          GitHub
                        </a>
                      )}

                      {project.demoLink && (
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-btn"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>

                    <button
                      className="apply-button"
                      onClick={() => toggleApply(project._id)}
                    >
                      {expandedProject === project._id ? "Cancel" : "Apply"}
                    </button>
                  </div>

                  {/* Apply Section */}

                  {expandedProject === project._id && (
                    <div className="apply-box">
                      <label>Select the role you want to apply for</label>

                      <select
                        value={selectedRole[project._id] || ""}
                        onChange={(e) =>
                          handleRoleChange(project._id, e.target.value)
                        }
                      >
                        <option value="">Select Role</option>

                        {(project.roleAllocations || []).map((role) => (
                          <option key={role.role} value={role.role}>
                            {role.role}
                          </option>
                        ))}
                      </select>

                      <button
                        className="confirm-button"
                        disabled={applyingProject === project._id}
                        onClick={() => handleApply(project._id)}
                      >
                        {applyingProject === project._id
                          ? "Submitting..."
                          : "Confirm Application"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
