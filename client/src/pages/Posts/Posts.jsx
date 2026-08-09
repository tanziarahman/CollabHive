import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  getMyProjects,
  deleteProject,
  getProjectJoinRequests,
} from "../../api/projects";
import {
  acceptJoinRequest,
  rejectJoinRequest,
} from "../../api/joinRequests";
import "./Posts.css";

export default function Posts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectRequests, setActiveProjectRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [inviteContext, setInviteContext] = useState(null);
  const [inviteCandidates, setInviteCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [invitedIds, setInvitedIds] = useState([]);
  const [invitingId, setInvitingId] = useState(null);

  const location = useLocation();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  useEffect(() => {
    if (location.state?.activeProjectId && projects.length > 0) {
      const restored = projects.find(
        (p) => p._id === location.state.activeProjectId
      );

      if (restored) {
        openApplicants(restored);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, location.state]);

  const fetchMyProjects = async () => {
    try {
      const data = await getMyProjects();

      const dummyProjects = [
        {
          _id: "project1",
          title: "Campus Connect",
          description:
            "A platform that helps university students connect, collaborate, and create projects together.",
          createdAt: "2026-08-01T10:00:00Z",

          techStack: [
            "React",
            "Node.js",
            "Express",
            "MongoDB",
          ],

          skillsRequired: [
            "React",
            "Node.js",
            "MongoDB",
            "Figma",
          ],

          roleAllocations: [
            {
              role: "Frontend Developer",
              count: 1,
            },
            {
              role: "Backend Developer",
              count: 1,
            },
            {
              role: "UI/UX Designer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/campus-connect",

          demoLink:
            "https://campus-connect-demo.example.com",

          members: ["user1", "user2"],
        },

        {
          _id: "project2",
          title: "AI Study Assistant",
          description:
            "An AI-powered study assistant that generates summaries, quizzes, and personalized learning recommendations.",
          createdAt: "2026-07-28T14:30:00Z",

          techStack: [
            "Python",
            "FastAPI",
            "React",
            "PostgreSQL",
          ],

          skillsRequired: [
            "Python",
            "FastAPI",
            "React",
            "Machine Learning",
          ],

          roleAllocations: [
            {
              role: "ML Engineer",
              count: 1,
            },
            {
              role: "Frontend Developer",
              count: 1,
            },
            {
              role: "Backend Developer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/ai-study-assistant",

          demoLink: "",

          members: ["user1"],
        },

        {
          _id: "project3",
          title: "BudgetBuddy",
          description:
            "A personal finance application for tracking expenses, setting budgets, and visualizing spending habits.",
          createdAt: "2026-07-20T09:15:00Z",

          techStack: [
            "React",
            "Express",
            "MongoDB",
            "Chart.js",
          ],

          skillsRequired: [
            "React",
            "Express",
            "MongoDB",
            "Chart.js",
          ],

          roleAllocations: [
            {
              role: "Frontend Developer",
              count: 2,
            },
            {
              role: "Backend Developer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/budget-buddy",

          demoLink:
            "https://budget-buddy.example.com",

          members: ["user1", "user3", "user4"],
        },

        {
          _id: "project4",
          title: "HealthTrack",
          description:
            "A web application that allows users to monitor daily activities, set fitness goals, and track their progress.",
          createdAt: "2026-07-15T16:45:00Z",

          techStack: [
            "Next.js",
            "TypeScript",
            "PostgreSQL",
            "Tailwind CSS",
          ],

          skillsRequired: [
            "Next.js",
            "TypeScript",
            "PostgreSQL",
            "Tailwind CSS",
          ],

          roleAllocations: [
            {
              role: "Full Stack Developer",
              count: 1,
            },
            {
              role: "UI/UX Designer",
              count: 1,
            },
            {
              role: "QA Engineer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/health-track",

          demoLink:
            "https://health-track.example.com",

          members: ["user1", "user5"],
        },

        {
          _id: "project5",
          title: "JobMatch AI",
          description:
            "An intelligent job recommendation platform that matches candidates with relevant job opportunities based on their skills.",
          createdAt: "2026-07-05T11:20:00Z",

          techStack: [
            "Python",
            "FastAPI",
            "React",
            "PostgreSQL",
          ],

          skillsRequired: [
            "Python",
            "Machine Learning",
            "React",
            "PostgreSQL",
          ],

          roleAllocations: [
            {
              role: "Machine Learning Engineer",
              count: 1,
            },
            {
              role: "React Developer",
              count: 1,
            },
            {
              role: "Backend Developer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/jobmatch-ai",

          demoLink:
            "https://jobmatch-ai.example.com",

          members: ["user1", "user2"],
        },
      ];

      setProjects(dummyProjects);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const openApplicants = async (project) => {
    setActiveProject(project);
    setLoadingRequests(true);

    try {
      const res = await getProjectJoinRequests(project._id);

      setActiveProjectRequests(
        (res.data || []).filter(
          (r) => r.type === "request"
        )
      );
    } catch {
      setActiveProjectRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApplicantDecision = async (
    requestId,
    decision
  ) => {
    setActionLoadingId(requestId);

    try {
      if (decision === "accepted") {
        await acceptJoinRequest(requestId);
      } else {
        await rejectJoinRequest(requestId);
      }

      setActiveProjectRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? { ...r, status: decision }
            : r
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Action failed."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (projectId) => {
    if (
      !window.confirm(
        "Delete this project? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProject(projectId);

      setProjects((prev) =>
        prev.filter((p) => p._id !== projectId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not delete project."
      );
    }
  };

  const openInvite = async (project, role) => {
    setInviteContext({
      project,
      role,
    });

    setInvitedIds([]);
    setLoadingCandidates(true);

    try {
      const token = localStorage.getItem("token");

      const skillsQuery = (
        project.skillsRequired || []
      ).join(",");

      const response = await fetch(
        `http://localhost:5000/api/users/search?skills=${encodeURIComponent(
          skillsQuery
        )}&excludeProjectId=${project._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setInviteCandidates(data);
    } catch {
      // Demo fallback until the backend search endpoint exists

      const required =
        project.skillsRequired || [];

      const demoUsers = [
        {
          _id: "u1",
          fullName: "Sarah Ahmed",
          skills: [
            "React",
            "CSS",
            "Figma",
          ],
        },
        {
          _id: "u2",
          fullName: "Rafiq Islam",
          skills: [
            "Node.js",
            "Express",
            "MongoDB",
          ],
        },
        {
          _id: "u3",
          fullName: "Meherin Chowdhury",
          skills: [
            "React",
            "JavaScript",
          ],
        },
        {
          _id: "u4",
          fullName: "Tanvir Hossain",
          skills: [
            "Python",
            "FastAPI",
          ],
        },
        {
          _id: "u5",
          fullName: "Nusrat Jahan",
          skills: [
            "React",
            "Node.js",
          ],
        },
      ];

      const filtered = demoUsers
        .map((u) => ({
          ...u,
          matchingSkills: u.skills.filter(
            (s) => required.includes(s)
          ),
        }))
        .filter(
          (u) => u.matchingSkills.length > 0
        );

      setInviteCandidates(filtered);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const closeInvite = () => {
    setInviteContext(null);
    setInviteCandidates([]);
  };

  const handleInvite = async (candidateId) => {
    if (!inviteContext) return;

    setInvitingId(candidateId);

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/projects/${inviteContext.project._id}/invite`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId: candidateId,
            role: inviteContext.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }
    } catch {
      // Backend endpoint not built yet
      // Invite still marked as sent locally
    } finally {
      setInvitedIds((prev) => [
        ...prev,
        candidateId,
      ]);

      setInvitingId(null);
    }
  };

  const anyOverlayOpen =
    Boolean(activeProject) ||
    Boolean(inviteContext);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="my-posts-page">
          <div className="my-posts-container">
            <div className="loading-state">
              Loading your projects...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        className={`my-posts-page ${
          anyOverlayOpen
            ? "is-blurred"
            : ""
        }`}
      >
        <div className="my-posts-container">

          <div className="page-header">
            <div>
              <h1>My Projects</h1>

              <p>
                Manage every project you've
                created.
              </p>
            </div>

            <Link
              to="/create-project"
              className="create-btn"
            >
              + Create Project
            </Link>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Projects Yet</h2>

              <p>
                Create your first collaborative
                project.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                className="project-card"
                key={project._id}
              >

                <div className="project-header">
                  <div>
                    <h2>
                      {project.title}
                    </h2>

                    <p>
                      Created{" "}
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="description">
                  {project.description}
                </p>

                {/* REQUIRED SKILLS */}

                <div className="section">
                  <h3>
                    Required Skills
                  </h3>

                  <div className="tags">
                    {(
                      project.skillsRequired ||
                      []
                    ).map((skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TECH STACK */}

                <div className="section">
                  <h3>
                    Tech Stack
                  </h3>

                  <div className="tags">
                    {(
                      project.techStack ||
                      []
                    ).map((tech) => (
                      <span key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OPEN ROLES */}

                <div className="section">
                  <h3>
                    Open Roles
                  </h3>

                  <div className="roles">
                    {(
                      project.roleAllocations ||
                      []
                    ).map((role) => (
                      <div
                        key={role.role}
                        className="role"
                      >
                        <span>
                          {role.role}
                        </span>

                        <strong>
                          {role.count}
                        </strong>

                        <button
                          type="button"
                          className="invite-btn"
                          onClick={() =>
                            openInvite(
                              project,
                              role.role
                            )
                          }
                        >
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RESOURCES */}

                <div className="resources">

                  {project.githubRepo && (
                    <a
                      href={
                        project.githubRepo
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  )}

                  {project.demoLink && (
                    <a
                      href={
                        project.demoLink
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo
                    </a>
                  )}

                </div>

                {/* FOOTER */}

                <div className="project-footer">

                  <span>
                    {project.members
                      ?.length || 0}{" "}
                    Members
                  </span>

                  <div className="actions">

                    <button
                      onClick={() =>
                        openApplicants(
                          project
                        )
                      }
                    >
                      View Applicants
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          project._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>
      </div>

      {/* APPLICANTS MODAL */}

      {activeProject && (
        <div
          className="applicants-overlay"
          onClick={() =>
            setActiveProject(null)
          }
        >
          <div
            className="applicants-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="applicants-modal-header">

              <div>
                <h2>
                  {activeProject.title}
                </h2>

                <p>
                  {
                    activeProjectRequests.length
                  }{" "}
                  Applicants
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setActiveProject(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="applicants-list">

              {loadingRequests ? (
                <div className="no-applicants">
                  Loading applicants...
                </div>
              ) : activeProjectRequests.length >
                0 ? (
                activeProjectRequests.map(
                  (request) => (
                    <div
                      className="applicant-row"
                      key={request._id}
                    >

                      <div className="applicant-info">

                        <span className="applicant-name">
                          {
                            request
                              .applicant
                              ?.fullName
                          }
                        </span>

                        <span className="applicant-role">
                          {request.role}
                        </span>

                      </div>

                      <div className="applicant-actions">

                        <Link
                          to={`/profile/${request.applicant?._id}`}
                          className="view-link"
                          state={{
                            activeProjectId:
                              activeProject._id,
                          }}
                        >
                          View Profile
                        </Link>

                        {request.status ===
                          "pending" && (
                          <>
                            <button
                              className="accept-btn"
                              disabled={
                                actionLoadingId ===
                                request._id
                              }
                              onClick={() =>
                                handleApplicantDecision(
                                  request._id,
                                  "accepted"
                                )
                              }
                            >
                              Accept
                            </button>

                            <button
                              className="reject-btn"
                              disabled={
                                actionLoadingId ===
                                request._id
                              }
                              onClick={() =>
                                handleApplicantDecision(
                                  request._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {request.status ===
                          "accepted" && (
                          <span className="decision-badge accepted">
                            Accepted
                          </span>
                        )}

                        {request.status ===
                          "rejected" && (
                          <span className="decision-badge rejected">
                            Rejected
                          </span>
                        )}

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="no-applicants">
                  No applicants yet.
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* INVITE MODAL */}

      {inviteContext && (
        <div
          className="applicants-overlay"
          onClick={closeInvite}
        >
          <div
            className="applicants-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="applicants-modal-header">

              <div>
                <h2>
                  Invite for{" "}
                  {inviteContext.role}
                </h2>

                <p>
                  {
                    inviteContext.project
                      .title
                  }
                </p>
              </div>

              <button
                className="close-btn"
                onClick={closeInvite}
              >
                ✕
              </button>

            </div>

            <div className="applicants-list">

              {loadingCandidates ? (
                <div className="no-applicants">
                  Finding matching people...
                </div>
              ) : inviteCandidates.length >
                0 ? (
                inviteCandidates.map(
                  (candidate) => (
                    <div
                      className="applicant-row"
                      key={candidate._id}
                    >

                      <div className="applicant-info">

                        <span className="applicant-name">
                          {
                            candidate.fullName
                          }
                        </span>

                        <span className="applicant-role">
                          {(
                            candidate.matchingSkills ||
                            candidate.skills ||
                            []
                          ).join(", ")}
                        </span>

                      </div>

                      <div className="applicant-actions">

                        <Link
                          to={`/profile/${candidate._id}`}
                          className="view-link"
                          state={{
                            inviteProjectId:
                              inviteContext
                                .project
                                ._id,
                          }}
                        >
                          View Profile
                        </Link>

                        {invitedIds.includes(
                          candidate._id
                        ) ? (
                          <span className="decision-badge accepted">
                            Invited
                          </span>
                        ) : (
                          <button
                            className="accept-btn"
                            disabled={
                              invitingId ===
                              candidate._id
                            }
                            onClick={() =>
                              handleInvite(
                                candidate._id
                              )
                            }
                          >
                            {invitingId ===
                            candidate._id
                              ? "Inviting..."
                              : "Invite"}
                          </button>
                        )}

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="no-applicants">
                  No matching people found
                  for this role's skills yet.
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </>
  );
}