import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  getMyCollaborations,
  deleteProject,
  updateProject,
  getProjectJoinRequests,
  getSuggestedCollaborators,
  inviteUser,
} from "../../api/projects";
import { acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import { getProjectConfig } from "../../api/config";
import { CATEGORY_OPTIONS } from "../../constants/projectCategories";
import "./Posts.css";

const emptyEditForm = {
  title: "",
  description: "",
  category: "",
  customCategory: "",
  skillsRequired: [],
  techStack: [],
  roleAllocations: [],
  duration: "",
  commitmentLevel: "",
  githubRepo: "",
  demoLink: "",
};

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
            matchedSkills: suggestion.matchedSkills,
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

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editSkillDraft, setEditSkillDraft] = useState("");
  const [editTechDraft, setEditTechDraft] = useState("");
  const [editRoleDraft, setEditRoleDraft] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [durationOptions, setDurationOptions] = useState([]);

  useEffect(() => {
    getProjectConfig()
      .then((data) => setDurationOptions(data.durations || []))
      .catch(() => setDurationOptions([]));
  }, []);

  const openEditProject = (project) => {
    const isPreset = CATEGORY_OPTIONS.includes(project.category);
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      category: isPreset ? project.category : "Other",
      customCategory: isPreset ? "" : project.category || "",
      skillsRequired: [...(project.skillsRequired || [])],
      techStack: [...(project.techStack || [])],
      roleAllocations: (project.roleAllocations || []).map((r) => ({ role: r.role, count: r.count })),
      duration: project.duration || "",
      commitmentLevel: project.commitmentLevel || "",
      githubRepo: project.githubRepo || "",
      demoLink: project.demoLink || "",
    });
    setEditSkillDraft("");
    setEditTechDraft("");
    setEditRoleDraft("");
    setEditError("");
    setEditingProjectId(project._id);
  };

  const closeEditProject = () => {
    setEditingProjectId(null);
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const addEditTagValue = (field, draft, setDraft) => {
    const value = draft.trim();
    if (!value) return;
    setEditForm((prev) => {
      if (prev[field].some((v) => v.toLowerCase() === value.toLowerCase())) return prev;
      return { ...prev, [field]: [...prev[field], value] };
    });
    setDraft("");
  };

  const removeEditTagValue = (field, index) => {
    setEditForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const addEditRole = () => {
    const roleName = editRoleDraft.trim();
    if (!roleName) return;
    setEditForm((prev) => {
      if (prev.roleAllocations.some((r) => r.role.toLowerCase() === roleName.toLowerCase())) return prev;
      return { ...prev, roleAllocations: [...prev.roleAllocations, { role: roleName, count: 1 }] };
    });
    setEditRoleDraft("");
  };

  const removeEditRole = (roleName) => {
    setEditForm((prev) => ({
      ...prev,
      roleAllocations: prev.roleAllocations.filter((r) => r.role !== roleName),
    }));
  };

  const changeEditRoleCount = (roleName, delta) => {
    setEditForm((prev) => ({
      ...prev,
      roleAllocations: prev.roleAllocations.map((r) =>
        r.role === roleName ? { ...r, count: Math.max(1, r.count + delta) } : r
      ),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.category) {
      setEditError("Title, description, and category are required.");
      return;
    }
    if (editForm.category === "Other" && !editForm.customCategory.trim()) {
      setEditError("Please specify your category.");
      return;
    }
    if (editForm.skillsRequired.length === 0) {
      setEditError("Please add at least one required skill.");
      return;
    }
    if (editForm.roleAllocations.length === 0) {
      setEditError("Please add at least one role.");
      return;
    }

    setEditSaving(true);
    setEditError("");
    try {
      const { customCategory, ...rest } = editForm;
      const payload = {
        ...rest,
        category: editForm.category === "Other" ? customCategory.trim() : editForm.category,
      };
      const res = await updateProject(editingProjectId, payload);
      setMyCollaborations((prev) =>
        prev.map((p) => (p._id === editingProjectId ? { ...p, ...res.data } : p))
      );
      setEditingProjectId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setEditSaving(false);
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
        matchedSkills: suggestion.matchedSkills,
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

  const editingProject = myCollaborations.find((p) => p._id === editingProjectId) || null;

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

                      {(project.skillsRequired || []).length > 0 && (
                        <>
                          <div className="my-project-collaborators-label">Required Skills</div>
                          <div className="my-project-tags">
                            {project.skillsRequired.map((skill) => (
                              <span className="my-project-tag" key={skill}>{skill}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {(project.techStack || []).length > 0 && (
                        <>
                          <div className="my-project-collaborators-label">Tech Stack</div>
                          <div className="my-project-tags">
                            {project.techStack.map((tech) => (
                              <span className="my-project-tag tech" key={tech}>{tech}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {(project.githubRepo || project.demoLink) && (
                        <>
                          <div className="my-project-collaborators-label">Resources</div>
                          <div className="my-project-resources">
                            {project.githubRepo && (
                              <a href={project.githubRepo} target="_blank" rel="noreferrer" className="my-project-resource-link">
                                GitHub
                              </a>
                            )}
                            {project.demoLink && (
                              <a href={project.demoLink} target="_blank" rel="noreferrer" className="my-project-resource-link">
                                Live Demo
                              </a>
                            )}
                          </div>
                        </>
                      )}

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
                                          {(candidate.matchedSkills || []).length > 0
                                            ? ` · Matches: ${candidate.matchedSkills.join(", ")}`
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
                            <button type="button" onClick={() => openEditProject(project)}>
                              Edit
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
            <p className="connections-hint">Ranked by how many of this project's required skills each person has.</p>
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
                        {(candidate.matchedSkills || []).length > 0
                          ? ` · Matches: ${candidate.matchedSkills.join(", ")}`
                          : ""}
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

      {editingProject && (
        <div className="connections-modal-backdrop" onClick={closeEditProject}>
          <section
            className="connections-modal edit-project-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="connections-modal-header">
              <h2>Edit {editingProject.title}</h2>
              <button type="button" onClick={closeEditProject} aria-label="Close">×</button>
            </div>

            <form className="edit-project-body" onSubmit={handleEditSubmit}>
              {editError && <div className="edit-project-error">{editError}</div>}

              <div className="edit-form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditFieldChange("title", e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => handleEditFieldChange("description", e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => handleEditFieldChange("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {editForm.category === "Other" && (
                <div className="edit-form-group">
                  <label>Specify category</label>
                  <input
                    type="text"
                    value={editForm.customCategory}
                    onChange={(e) => handleEditFieldChange("customCategory", e.target.value)}
                  />
                </div>
              )}

              <div className="edit-form-group">
                <label>Required Skills</label>
                <div className="edit-tag-input-row">
                  <input
                    type="text"
                    placeholder="Type a skill and press Add"
                    value={editSkillDraft}
                    onChange={(e) => setEditSkillDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditTagValue("skillsRequired", editSkillDraft, setEditSkillDraft);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addEditTagValue("skillsRequired", editSkillDraft, setEditSkillDraft)}
                  >
                    Add
                  </button>
                </div>
                <div className="edit-tag-list">
                  {editForm.skillsRequired.map((skill, i) => (
                    <span className="edit-tag-chip" key={`${skill}-${i}`}>
                      {skill}
                      <button type="button" aria-label={`Remove ${skill}`} onClick={() => removeEditTagValue("skillsRequired", i)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="edit-form-group">
                <label>Tech Stack</label>
                <div className="edit-tag-input-row">
                  <input
                    type="text"
                    placeholder="Type a tool/technology and press Add"
                    value={editTechDraft}
                    onChange={(e) => setEditTechDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditTagValue("techStack", editTechDraft, setEditTechDraft);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addEditTagValue("techStack", editTechDraft, setEditTechDraft)}
                  >
                    Add
                  </button>
                </div>
                <div className="edit-tag-list">
                  {editForm.techStack.map((tech, i) => (
                    <span className="edit-tag-chip" key={`${tech}-${i}`}>
                      {tech}
                      <button type="button" aria-label={`Remove ${tech}`} onClick={() => removeEditTagValue("techStack", i)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="edit-form-group">
                <label>Team Structure</label>
                <div className="edit-tag-input-row">
                  <input
                    type="text"
                    placeholder="Type a role and press Add Role"
                    value={editRoleDraft}
                    onChange={(e) => setEditRoleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditRole();
                      }
                    }}
                  />
                  <button type="button" onClick={addEditRole}>Add Role</button>
                </div>
                {editForm.roleAllocations.length > 0 && (
                  <div className="edit-role-list">
                    {editForm.roleAllocations.map(({ role, count }) => (
                      <div key={role} className="edit-role-row">
                        <span className="edit-role-name">{role}</span>
                        <div className="edit-role-counter">
                          <button type="button" onClick={() => changeEditRoleCount(role, -1)} disabled={count <= 1}>−</button>
                          <span>{count}</span>
                          <button type="button" onClick={() => changeEditRoleCount(role, 1)}>+</button>
                        </div>
                        <button type="button" className="edit-role-remove" aria-label={`Remove ${role}`} onClick={() => removeEditRole(role)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="edit-form-group">
                <label>Expected Duration</label>
                {durationOptions.length > 0 ? (
                  <select
                    value={editForm.duration}
                    onChange={(e) => handleEditFieldChange("duration", e.target.value)}
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map((dur) => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => handleEditFieldChange("duration", e.target.value)}
                  />
                )}
              </div>

              <div className="edit-form-group">
                <label>Commitment Level</label>
                <input
                  type="text"
                  value={editForm.commitmentLevel}
                  onChange={(e) => handleEditFieldChange("commitmentLevel", e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>GitHub Repo</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={editForm.githubRepo}
                  onChange={(e) => handleEditFieldChange("githubRepo", e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>Live Demo Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.demoLink}
                  onChange={(e) => handleEditFieldChange("demoLink", e.target.value)}
                />
              </div>

              <div className="edit-form-actions">
                <button type="button" className="edit-cancel-btn" onClick={closeEditProject}>
                  Cancel
                </button>
                <button type="submit" className="edit-save-btn" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}