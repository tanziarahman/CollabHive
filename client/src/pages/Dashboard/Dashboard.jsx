import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getMe } from "../../api/auth";
import { getProjectFeed, getProjects, createJoinRequest } from "../../api/projects";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const [applyingProject, setApplyingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchDashboard() {
    setLoading(true);

    // Each piece loads independently so one failing doesn't wipe out the others.
    const [userResult, feedResult, allProjectsResult] = await Promise.allSettled([
      getMe(),
      getProjectFeed(),
      getProjects(),
    ]);

    if (userResult.status === "fulfilled") {
      setUser(userResult.value);
    } else {
      setError("Could not load your account. Please try logging in again.");
    }

    if (feedResult.status === "fulfilled") {
      setProjects(feedResult.value.data || []);
    }

    if (allProjectsResult.status === "fulfilled") {
      setAllProjects(allProjectsResult.value.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

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
      await createJoinRequest(projectId, { role });
      alert("Application submitted successfully.");
      setExpandedProject(null);
    } catch (err) {
      alert(err.response?.data?.message || "Application failed.");
    } finally {
      setApplyingProject(null);
    }
  };

  const isSearching = searchTerm.trim().length > 0;

  // Searching looks across every project on the platform (not just the feed
  // of people you follow), since that's what "search projects" should mean.
  const visibleProjects = isSearching
    ? allProjects.filter((project) => {
        const term = searchTerm.trim().toLowerCase();
        return (
          (project.title || "").toLowerCase().includes(term) ||
          (project.category || "").toLowerCase().includes(term) ||
          (project.createdBy?.fullName || "").toLowerCase().includes(term)
        );
      })
    : projects;

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
      <Navbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search projects by name or category..."
      />

      <div className="dashboard-page">
        <div className="dashboard-container">
          {/* Hero Section */}

          <section className="dashboard-hero">
            <div className="hero-left">
              <h1>Welcome back{user?.fullName ? `, ${user.fullName}` : ""} 👋</h1>

              <p>
                See what the people you follow are building, and start
                collaborating with other developers.
              </p>
            </div>
          </section>

          {/* Empty State */}

          {isSearching && visibleProjects.length === 0 ? (
            <div className="empty-state">
              <h2>No matching projects</h2>

              <p>No projects found matching &ldquo;{searchTerm}&rdquo;. Try a different name, category, or creator.</p>
            </div>
          ) : !isSearching && projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Projects Yet</h2>

              <p>Follow other collaborators to see the projects they post here, or search above to browse every project on CollabHive.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {visibleProjects.map((project) => (
                <div className="project-card" key={project._id}>
                  {/* Header */}

                  <div className="project-header">
                    <div>
                      <h2>{project.title}</h2>

                      <p className="creator">
                        Created by{" "}
                        <button
                          type="button"
                          className="creator-link"
                          onClick={() => navigate(`/profile/${project.createdBy?._id}`)}
                        >
                          {project.createdBy?.fullName}
                        </button>
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

                  {/* Timeline & Commitment */}

                  {(project.duration || project.commitmentLevel) && (
                    <div className="info-section">
                      <h3>Timeline & Commitment</h3>

                      <div className="tag-container">
                        {project.duration && <span className="tag">{project.duration}</span>}
                        {project.commitmentLevel && <span className="tag">{project.commitmentLevel}</span>}
                      </div>
                    </div>
                  )}

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
                      {(project.resources || []).map((resource, i) => (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-btn"
                          key={`${resource.name}-${i}`}
                        >
                          {resource.name}
                        </a>
                      ))}
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