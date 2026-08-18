import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  getMyCollaborations,
  deleteProject,
  getProjectJoinRequests,
  getSuggestedCollaborators,
  inviteUser,
} from "../../api/projects";
import { acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import "./Posts.css";

export default function Posts() {
  const navigate = useNavigate();

  const [myCollaborations, setMyCollaborations] = useState([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(true);

  const loadCollaborations = async () => {
    try {
      const res = await getMyCollaborations();
      setMyCollaborations(res.data || []);
    } catch {
      setMyCollaborations([]);
    } finally {
      setCollaborationsLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

  const [activeApplicantsProject, setActiveApplicantsProject] = useState(null);
  const [activeProjectRequests, setActiveProjectRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [inviteContext, setInviteContext] = useState(null);
  const [inviteCandidates, setInviteCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [invitedIds, setInvitedIds] = useState([]);
  const [invitingId, setInvitingId] = useState(null);

  // Always-visible "recommended people to invite" preview per owned project,
  // so the skill-match feature doesn't depend on the user noticing/clicking
  // an "Invite for <role>" button first.
  const [recommendationsByProject, setRecommendationsByProject] = useState({});
  const [inlineInvitedIds, setInlineInvitedIds] = useState({});
  const [inlineInvitingKey, setInlineInvitingKey] = useState(null);
  const fetchedRecommendationsRef = useRef(new Set());

  useEffect(() => {
    myCollaborations.forEach((project) => {
      if (!project.isOwner) return;
      if (fetchedRecommendationsRef.current.has(project._id)) return;
      fetchedRecommendationsRef.current.add(project._id);

      setRecommendationsByProject((prev) => ({
        ...prev,
        [project._id]: { loading: true, candidates: [] },
      }));

      getSuggestedCollaborators(project._id, 5)
        .then((res) => {
          const candidates = (res.data || []).map((suggestion) => ({
            ...suggestion.user,
            matchScore: suggestion.matchScore,
          }));
          setRecommendationsByProject((prev) => ({
            ...prev,
            [project._id]: { loading: false, candidates },
          }));
        })
        .catch(() => {
          setRecommendationsByProject((prev) => ({
            ...prev,
            [project._id]: { loading: false, candidates: [] },
          }));
        });
    });
  }, [myCollaborations]);

  const handleInlineInvite = async (project, candidateId) => {
    const role = project.roleAllocations?.[0]?.role;
    if (!role) return;
    const key = `${project._id}:${candidateId}`;
    setInlineInvitingKey(key);
    try {
      await inviteUser(project._id, { userId: candidateId, role });
      setInlineInvitedIds((prev) => ({
        ...prev,
        [project._id]: [...(prev[project._id] || []), candidateId],
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Could not send invite.");
    } finally {
      setInlineInvitingKey(null);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(projectId);
      setMyCollaborations((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete project.");
    }
  };

  const openApplicants = async (project) => {
    setActiveApplicantsProject(project);
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
      loadCollaborations();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openInvite = async (project, role) => {
    setInviteContext({ project, role });
    setInvitedIds([]);
    setLoadingCandidates(true);
    try {
      const res = await getSuggestedCollaborators(project._id, 10);
      const candidates = (res.data || []).map((suggestion) => ({
        ...suggestion.user,
        matchScore: suggestion.matchScore,
      }));
      setInviteCandidates(candidates);
    } catch {
      setInviteCandidates([]);
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
      await inviteUser(inviteContext.project._id, {
        userId: candidateId,
        role: inviteContext.role,
      });
      setInvitedIds((prev) => [...prev, candidateId]);
    } catch (err) {
      alert(err.response?.data?.message || "Could not send invite.");
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <>
      <Navbar hideSearch />

      <div className="my-posts-page">
        <div className="my-posts-container">
          <div className="panel">
                        <div className="info-block">
              <div className="info-block-header">
                <h3>
                  <span className="hex-dot" /> My projects
                </h3>
                <button
                  type="button"
                  className="add-project-btn"
                  onClick={() => navigate("/create-project")}
                  aria-label="Create new project"
                  title="Create new project"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add
                </button>
              </div>

              {collaborationsLoading ? (
                <p className="pill-empty">Loading your projects...</p>
              ) : myCollaborations.length === 0 ? (
                <p className="pill-empty">
                  You haven't created or joined any projects yet.
                </p>
              ) : (
                <div className="my-projects-list">
                  {myCollaborations.map((project) => (
                    <div className="my-project-card" key={project._id}>
                      <div className="my-project-card-header">
                        <div>
                          <h4>{project.title}</h4>
                          {project.category && (
                            <span className="my-project-category">{project.category}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="my-project-chat-btn"
                          onClick={() => navigate(`/projects/${project._id}/chat`)}
                          aria-label={`Open group chat for ${project.title}`}
                          title="Group chat"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </button>
                      </div>

                      <p className="my-project-description">{project.description}</p>

                      <div className="my-project-collaborators-label">Working on this</div>
                      <div className="my-project-collaborators">
                        {project.collaborators.map((person) => (
                          <span className="my-project-collaborator" key={person._id}>
                            <span className="my-project-collaborator-avatar">
                              {person.profilePicture ? (
                                <img src={person.profilePicture} alt="" />
                              ) : (
                                person.fullName?.charAt(0)
                              )}
                            </span>
                            {person.fullName}
                          </span>
                        ))}
                      </div>

                      {project.isOwner && (
                        <>
                          <div className="my-project-collaborators-label">Open roles</div>
                          <div className="my-project-collaborators">
                            {(project.roleAllocations || []).map((role) => (
                              <button
                                type="button"
                                key={role.role}
                                className="my-project-invite-btn"
                                onClick={() => openInvite(project, role.role)}
                              >
                                Invite for {role.role} ({role.count})
                              </button>
                            ))}
                          </div>

                          <div className="my-project-collaborators-label">Recommended people to invite</div>
                          {(() => {
                            const rec = recommendationsByProject[project._id];
                            if (!rec || rec.loading) {
                              return <p className="recommend-hint">Finding the best matches...</p>;
                            }
                            if (rec.candidates.length === 0) {
                              return (
                                <p className="recommend-hint">
                                  No matching people found yet — add more skills to your profile or project to improve matches.
                                </p>
                              );
                            }
                            const invitedHere = inlineInvitedIds[project._id] || [];
                            return (
                              <div className="recommend-list">
                                {rec.candidates.map((candidate) => {
                                  const key = `${project._id}:${candidate._id}`;
                                  const alreadyInvited = invitedHere.includes(candidate._id);
                                  return (
                                    <div className="recommend-row" key={candidate._id}>
                                      <span className="my-project-collaborator-avatar">
                                        {candidate.profilePicture ? (
                                          <img src={candidate.profilePicture} alt="" />
                                        ) : (
                                          candidate.fullName?.charAt(0)
                                        )}
                                      </span>
                                      <span className="recommend-name">
                                        {candidate.fullName}
                                        <small>
                                          {Math.round((candidate.matchScore || 0) * 100)}% match
                                          {(candidate.skills || []).length > 0
                                            ? ` · ${candidate.skills.slice(0, 3).join(", ")}`
                                            : ""}
                                        </small>
                                      </span>
                                      <div className="recommend-row-actions">
                                        <button
                                          type="button"
                                          className="recommend-invite-btn"
                                          onClick={() => navigate(`/profile/${candidate._id}`)}
                                        >
                                          View
                                        </button>
                                        {alreadyInvited ? (
                                          <span className="recommend-invited-label">Invited</span>
                                        ) : (
                                          <button
                                            type="button"
                                            className="recommend-invite-btn primary"
                                            disabled={inlineInvitingKey === key}
                                            onClick={() => handleInlineInvite(project, candidate._id)}
                                          >
                                            {inlineInvitingKey === key ? "Inviting..." : "Invite"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          <div className="my-project-owner-actions">
                            <button type="button" onClick={() => openApplicants(project)}>
                              View Applicants
                            </button>
                            <button
                              type="button"
                              className="my-project-delete-btn"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeApplicantsProject && (
        <div className="connections-modal-backdrop" onClick={() => setActiveApplicantsProject(null)}>
          <section className="connections-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="connections-modal-header">
              <h2>{activeApplicantsProject.title}</h2>
              <button type="button" onClick={() => setActiveApplicantsProject(null)} aria-label="Close">×</button>
            </div>
            <div className="connections-list">
              {loadingRequests ? (
                <p className="connections-empty">Loading applicants...</p>
              ) : activeProjectRequests.length === 0 ? (
                <p className="connections-empty">No applicants yet.</p>
              ) : (
                activeProjectRequests.map((request) => (
                  <div className="connection-person" key={request._id}>
                    <span className="connection-avatar">
                      {request.applicant?.profilePicture ? (
                        <img src={request.applicant.profilePicture} alt="" />
                      ) : (
                        request.applicant?.fullName?.charAt(0)
                      )}
                    </span>
                    <span>
                      <b>{request.applicant?.fullName}</b>
                      <small>{request.role}</small>
                    </span>
                    {request.status === "pending" ? (
                      <div className="invitation-actions">
                        <button
                          type="button"
                          className="reject-btn"
                          disabled={actionLoadingId === request._id}
                          onClick={() => handleApplicantDecision(request._id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="accept-btn"
                          disabled={actionLoadingId === request._id}
                          onClick={() => handleApplicantDecision(request._id, "accepted")}
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <em>{request.status === "accepted" ? "Accepted" : "Rejected"}</em>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {inviteContext && (
        <div className="connections-modal-backdrop" onClick={closeInvite}>
          <section className="connections-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="connections-modal-header">
              <h2>Recommended for {inviteContext.role}</h2>
              <button type="button" onClick={closeInvite} aria-label="Close">×</button>
            </div>
            <p className="connections-hint">Ranked by how closely their skills match this project.</p>
            <div className="connections-list">
              {loadingCandidates ? (
                <p className="connections-empty">Finding the best matches...</p>
              ) : inviteCandidates.length === 0 ? (
                <p className="connections-empty">No matching people found for this project's skills yet.</p>
              ) : (
                inviteCandidates.map((candidate) => (
                  <div className="connection-person" key={candidate._id}>
                    <span className="connection-avatar">
                      {candidate.profilePicture ? (
                        <img src={candidate.profilePicture} alt="" />
                      ) : (
                        candidate.fullName?.charAt(0)
                      )}
                    </span>
                    <span>
                      <b>{candidate.fullName}</b>
                      <small>
                        {Math.round((candidate.matchScore || 0) * 100)}% match
                        {(candidate.skills || []).length > 0 ? ` · ${candidate.skills.slice(0, 3).join(", ")}` : ""}
                      </small>
                    </span>
                    {invitedIds.includes(candidate._id) ? (
                      <em>Invited</em>
                    ) : (
                      <button
                        type="button"
                        className="accept-btn"
                        disabled={invitingId === candidate._id}
                        onClick={() => handleInvite(candidate._id)}
                      >
                        {invitingId === candidate._id ? "Inviting..." : "Invite"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}