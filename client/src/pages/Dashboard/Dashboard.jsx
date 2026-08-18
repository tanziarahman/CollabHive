import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getMe } from "../../api/auth";
import { getProjectFeed, getProjects, createJoinRequest } from "../../api/projects";
import { getSuggestions, sendFollowRequest } from "../../api/users";
import "./Dashboard.css";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [followingId, setFollowingId] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const [applyingProject, setApplyingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchDashboard() {
    setLoading(true);

    // Each piece loads independently so one failing doesn't wipe out the others.
    const [userResult, feedResult, allProjectsResult, suggestionsResult] = await Promise.allSettled([
      getMe(),
      getProjectFeed(),
      getProjects(),
      getSuggestions(),
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

    if (suggestionsResult.status === "fulfilled") {
      setSuggestions(suggestionsResult.value || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleFollow = async (person) => {
    setFollowingId(person._id);
    try {
      await sendFollowRequest(person._id);
      setSuggestions((items) => items.filter((item) => item._id !== person._id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not send follow request.");
    } finally {
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
                        Created by {project.createdBy?.fullName}
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