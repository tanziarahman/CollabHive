import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getMyProjects, deleteProject, getProjectJoinRequests } from "../../api/projects";
import { acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import "./Posts.css";

export default function Posts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectRequests, setActiveProjectRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  useEffect(() => {
    if (location.state?.activeProjectId && projects.length > 0) {
      const restored = projects.find(
        (p) => p._id === location.state.activeProjectId
      );
      if (restored) openApplicants(restored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, location.state]);

  const fetchMyProjects = async () => {
    try {
      const data = await getMyProjects();
      setProjects(data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your projects.");
    } finally {
      setLoading(false);
    }
  };

  const openApplicants = async (project) => {
    setActiveProject(project);
    setLoadingRequests(true);
    try {
      const res = await getProjectJoinRequests(project._id);
      setActiveProjectRequests((res.data || []).filter((r) => r.type === "request"));
    } catch {
      setActiveProjectRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApplicantDecision = async (requestId, decision) => {
    setActionLoadingId(requestId);
    try {
      if (decision === "accepted") {
        await acceptJoinRequest(requestId);
      } else {
        await rejectJoinRequest(requestId);
      }
      setActiveProjectRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: decision } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete project.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="my-posts-page">
          <div className="loading-state">Loading your projects...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={`my-posts-page ${activeProject ? "is-blurred" : ""}`}>
        <div className="my-posts-container">
          <div className="page-header">
            <div>
              <h1>My Projects</h1>
              <p>Manage every project you've created.</p>
            </div>

            <Link to="/create-project" className="create-btn">
              + Create Project
            </Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          {projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Projects Yet</h2>
              <p>Create your first collaborative project.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div className="project-card" key={project._id}>
                <div className="project-header">
                  <div>
                    <h2>{project.title}</h2>
                    <p>Created {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <p className="description">{project.description}</p>

                <div className="section">
                  <h3>Required Skills</h3>
                  <div className="tags">
                    {(project.skillsRequired || []).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h3>Open Roles</h3>
                  <div className="roles">
                    {(project.roleAllocations || []).map((role) => (
                      <div key={role.role} className="role">
                        <span>{role.role}</span>
                        <strong>{role.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resources">
                  {project.githubRepo && (
                    <a href={project.githubRepo} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}

                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noreferrer">
                      Live Demo
                    </a>
                  )}
                </div>

                <div className="project-footer">
                  <span>{project.members?.length || 0} Members</span>

                  <div className="actions">
                    <button onClick={() => openApplicants(project)}>
                      View Applicants
                    </button>

                    <button className="delete-btn" onClick={() => handleDelete(project._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeProject && (
        <div
          className="applicants-overlay"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="applicants-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="applicants-modal-header">
              <div>
                <h2>{activeProject.title}</h2>
                <p>{activeProjectRequests.length} Applicants</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setActiveProject(null)}
              >
                ✕
              </button>
            </div>

            <div className="applicants-list">
              {loadingRequests ? (
                <div className="no-applicants">Loading applicants...</div>
              ) : activeProjectRequests.length > 0 ? (
                activeProjectRequests.map((request) => (
                  <div className="applicant-row" key={request._id}>
                    <div className="applicant-info">
                      <span className="applicant-name">{request.applicant?.fullName}</span>
                      <span className="applicant-role">{request.role}</span>
                    </div>

                    <div className="applicant-actions">
                      <Link
                        to={`/profile/${request.applicant?._id}`}
                        className="view-link"
                        state={{ activeProjectId: activeProject._id }}
                      >
                        View Profile
                      </Link>

                      {request.status === "pending" && (
                        <>
                          <button
                            className="accept-btn"
                            disabled={actionLoadingId === request._id}
                            onClick={() => handleApplicantDecision(request._id, "accepted")}
                          >
                            Accept
                          </button>

                          <button
                            className="reject-btn"
                            disabled={actionLoadingId === request._id}
                            onClick={() => handleApplicantDecision(request._id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {request.status === "accepted" && (
                        <span className="decision-badge accepted">Accepted</span>
                      )}

                      {request.status === "rejected" && (
                        <span className="decision-badge rejected">Rejected</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-applicants">No applicants yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
