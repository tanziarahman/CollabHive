import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getProjectById, getSimilarProjects, createJoinRequest } from "../../api/projects";
import { getProjectComments, addComment, deleteComment } from "../../api/comments";
import { getStoredUser } from "../../utils/session";
import "./ProjectDetail.css";

const STATUS_CLASS = {
  Active: "status-active",
  Completed: "status-completed",
  "On Hold": "status-onhold",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProjectById(projectId);
        setProject(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this project.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  useEffect(() => {
    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await getProjectComments(projectId);
        setComments(res.data || []);
      } catch {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [projectId]);

  useEffect(() => {
    const loadSimilar = async () => {
      setSimilarLoading(true);
      try {
        const res = await getSimilarProjects(projectId, 6);
        setSimilar(res.data || []);
      } catch {
        setSimilar([]);
      } finally {
        setSimilarLoading(false);
      }
    };
    loadSimilar();
  }, [projectId]);

  const isOwner = project && currentUser && project.createdBy?._id === currentUser._id;
  const isMember = project && currentUser && (project.members || []).some((m) => m.user?._id === currentUser._id);

  const handlePostComment = async (e) => {
    e.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    setPostingComment(true);
    try {
      const res = await addComment(projectId, text);
      setComments((prev) => [...prev, res.data]);
      setCommentDraft("");
    } catch (err) {
      alert(err.response?.data?.message || "Could not post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(projectId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete comment.");
    }
  };

  const handleApply = async () => {
    if (!selectedRole) {
      alert("Please select a role.");
      return;
    }
    setApplying(true);
    try {
      await createJoinRequest(projectId, { role: selectedRole });
      setApplied(true);
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar hideSearch />
        <main className="pd-page">
          <div className="pd-loading">Loading project...</div>
        </main>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Navbar hideSearch />
        <main className="pd-page">
          <div className="pd-loading">{error || "Project not found."}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar hideSearch />
      <main className="pd-page">
        <div className="pd-wrap">
          <div className="pd-header">
            <div>
              <div className="pd-badges">
                {project.category && <span className="pd-category-badge">{project.category}</span>}
                {project.status && (
                  <span className={`pd-status-badge ${STATUS_CLASS[project.status] || ""}`}>
                    {project.status}
                  </span>
                )}
              </div>
              <h1>{project.title}</h1>
              <p className="pd-creator">
                Created by{" "}
                <button type="button" className="pd-creator-link" onClick={() => navigate(`/profile/${project.createdBy?._id}`)}>
                  {project.createdBy?.fullName}
                </button>
                {" · "}
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isOwner && (
              <button type="button" className="pd-manage-btn" onClick={() => navigate("/my-posts")}>
                Manage in My Projects
              </button>
            )}
          </div>

          <div className="pd-card">
            <p className="pd-description">{project.description}</p>

            {(project.skillsRequired || []).length > 0 && (
              <div className="pd-section">
                <h3>Required Skills</h3>
                <div className="pd-tags">
                  {project.skillsRequired.map((s) => (
                    <span className="pd-tag" key={s}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {(project.techStack || []).length > 0 && (
              <div className="pd-section">
                <h3>Tech Stack</h3>
                <div className="pd-tags">
                  {project.techStack.map((t) => (
                    <span className="pd-tag tech" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-section">
              <h3>Timeline &amp; Commitment</h3>
              <div className="pd-tags">
                {project.duration && <span className="pd-tag">{project.duration}</span>}
                {project.commitmentLevel && <span className="pd-tag">{project.commitmentLevel}</span>}
              </div>
            </div>

            {(project.roleAllocations || []).length > 0 && (
              <div className="pd-section">
                <h3>Open Roles</h3>
                <div className="pd-tags">
                  {project.roleAllocations.map((r) => {
                    const remaining = r.remaining ?? r.count;
                    return (
                      <span className="pd-tag" key={r.role}>
                        {r.role} ({remaining > 0 ? `${remaining} needed` : "filled"})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(project.resources || []).length > 0 && (
              <div className="pd-section">
                <h3>Resources</h3>
                <div className="pd-resources">
                  {project.resources.map((resource, i) => (
                    <a href={resource.url} target="_blank" rel="noreferrer" className="pd-resource-link" key={`${resource.name}-${i}`}>
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(project.members || []).length > 0 && (
              <div className="pd-section">
                <h3>Team</h3>
                <div className="pd-members">
                  {project.members.map((m) => (
                    <Link to={`/profile/${m.user?._id}`} className="pd-member" key={m.user?._id}>
                      <span className="pd-member-avatar">
                        {m.user?.profilePicture ? <img src={m.user.profilePicture} alt="" /> : m.user?.fullName?.charAt(0)}
                      </span>
                      {m.user?.fullName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!isOwner && !isMember && project.status === "Active" &&
              (project.roleAllocations || []).some((r) => (r.remaining ?? r.count) > 0) && (
              <div className="pd-apply-box">
                {applied ? (
                  <p className="pd-applied-message">Application submitted — the project owner will review it.</p>
                ) : (
                  <>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      <option value="">Select a role to apply for</option>
                      {project.roleAllocations
                        .filter((r) => (r.remaining ?? r.count) > 0)
                        .map((r) => (
                          <option key={r.role} value={r.role}>{r.role}</option>
                        ))}
                    </select>
                    <button type="button" className="pd-apply-btn" disabled={applying} onClick={handleApply}>
                      {applying ? "Applying..." : "Apply"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pd-card">
            <h3 className="pd-card-heading">Comments &amp; Questions</h3>

            <form className="pd-comment-form" onSubmit={handlePostComment}>
              <textarea
                placeholder="Ask a question or leave a comment..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={2}
              />
              <button type="submit" disabled={postingComment || !commentDraft.trim()}>
                {postingComment ? "Posting..." : "Post"}
              </button>
            </form>

            {commentsLoading ? (
              <p className="pd-empty-hint">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="pd-empty-hint">No comments yet — be the first to ask something.</p>
            ) : (
              <div className="pd-comment-list">
                {comments.map((comment) => {
                  const canDelete = currentUser && (comment.author?._id === currentUser._id || isOwner);
                  return (
                    <div className="pd-comment" key={comment._id}>
                      <span className="pd-comment-avatar">
                        {comment.author?.profilePicture ? (
                          <img src={comment.author.profilePicture} alt="" />
                        ) : (
                          comment.author?.fullName?.charAt(0)
                        )}
                      </span>
                      <div className="pd-comment-body">
                        <div className="pd-comment-meta">
                          <b>{comment.author?.fullName}</b>
                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                      {canDelete && (
                        <button type="button" className="pd-comment-delete" aria-label="Delete comment" onClick={() => handleDeleteComment(comment._id)}>
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pd-card">
            <h3 className="pd-card-heading">Similar Projects</h3>
            {similarLoading ? (
              <p className="pd-empty-hint">Finding similar projects...</p>
            ) : similar.length === 0 ? (
              <p className="pd-empty-hint">No similar projects found yet.</p>
            ) : (
              <div className="pd-similar-grid">
                {similar.map((s) => (
                  <button type="button" className="pd-similar-card" key={s._id} onClick={() => navigate(`/projects/${s._id}`)}>
                    <div className="pd-similar-top">
                      <b>{s.title}</b>
                      <span className="pd-similar-match">{Math.round((s.matchScore || 0) * 100)}% match</span>
                    </div>
                    <p>{s.description}</p>
                    {(s.matchedSkills || []).length > 0 && (
                      <span className="pd-similar-matches">Matches: {s.matchedSkills.join(", ")}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
