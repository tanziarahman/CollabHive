import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { dismissNotificationId } from "../../utils/notificationDismissals";
import { getMyJoinRequests, acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import "./InvitationDetail.css";

export default function InvitationDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = location.state?.notification;

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      if (!notification?.relatedJoinRequest) {
        setError("This invitation could not be found.");
        setLoading(false);
        return;
      }
      try {
        const res = await getMyJoinRequests();
        const match = (res.data || []).find(
          (jr) => jr._id === notification.relatedJoinRequest
        );
        if (!match) {
          setError("This invitation is no longer available.");
        } else {
          setInvite(match);
        }
      } catch {
        setError("Could not load this invitation.");
      } finally {
        setLoading(false);
      }
    };
    loadInvite();
  }, [notification]);

  const senderName = invite?.initiatedBy?.fullName || notification?.sender?.fullName || "A project owner";
  const projectTitle = invite?.project?.title || notification?.project?.title || "Untitled project";

  const initials =
    senderName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const handleDecision = async (action) => {
    if (!invite) return;
    setResponding(true);
    try {
      if (action === "accepted") {
        await acceptJoinRequest(invite._id);
      } else {
        await rejectJoinRequest(invite._id);
      }
      setDecision(action);
      dismissNotificationId(notification._id);
    } catch (err) {
      alert(err.response?.data?.message || "Could not respond to this invitation.");
    } finally {
      setResponding(false);
    }
  };

  useEffect(() => {
    if (!decision) return undefined;
    const timer = window.setTimeout(() => navigate("/my-posts"), 2200);
    return () => window.clearTimeout(timer);
  }, [decision, navigate]);

  if (loading) {
    return (
      <>
        <Navbar hideSearch />
        <main className="invitation-page">
          <div className="loading-state">Loading invitation...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar hideSearch />
        <main className="invitation-page">
          <div className="invitation-result">
            <h2>{error}</h2>
            <span className="invitation-result-redirect">
              <button type="button" onClick={() => navigate("/my-posts")}>
                Back to Posts
              </button>
            </span>
          </div>
        </main>
      </>
    );
  }

  if (decision) {
    return (
      <>
        <Navbar hideSearch />
        <main className="invitation-page">
          <div className="invitation-result">
            <div className={`invitation-result-icon ${decision}`}>
              {decision === "accepted" ? "✓" : "✕"}
            </div>
            <h2>{decision === "accepted" ? "You're in!" : "Invitation declined"}</h2>
            <p>
              {decision === "accepted"
                ? `You've joined ${projectTitle} as a collaborator.`
                : `You've declined the invitation to ${projectTitle}.`}
            </p>
            <span className="invitation-result-redirect">Taking you back to Posts...</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar hideSearch />

      <main className="invitation-page">
        <div className="invitation-wrap">
          <div className="invitation-hero">
            <div className="invitation-hero-avatar">{initials}</div>
            <div className="invitation-hero-text">
              <span className="invitation-hero-eyebrow">Project Invitation</span>
              <h1>{projectTitle}</h1>
              <p>{senderName} invited you to collaborate</p>
            </div>
          </div>

          <div className="invitation-body-card">
            <div className="invitation-meta-row">
              <div className="invitation-meta">
                <span className="meta-label">Invited role</span>
                <span className="meta-value">{invite.role}</span>
              </div>
              <div className="invitation-meta">
                <span className="meta-label">Team size</span>
                <span className="meta-value">
                  {invite.project?.members?.length || 0}/{invite.project?.totalMembers || 0}
                </span>
              </div>
            </div>

            <p className="invitation-description">{invite.project?.description}</p>

            <div className="invitation-chip-group">
              <span className="chip-group-label">Skills</span>
              <div className="chips">
                {(invite.project?.skillsRequired || []).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="invitation-chip-group">
              <span className="chip-group-label">Tech stack</span>
              <div className="chips">
                {(invite.project?.techStack || []).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>

            <div className="invitation-actions">
              <button
                type="button"
                className="invitation-reject-btn"
                disabled={responding}
                onClick={() => handleDecision("rejected")}
              >
                Decline
              </button>
              <button
                type="button"
                className="invitation-accept-btn"
                disabled={responding}
                onClick={() => handleDecision("accepted")}
              >
                Accept invitation
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
