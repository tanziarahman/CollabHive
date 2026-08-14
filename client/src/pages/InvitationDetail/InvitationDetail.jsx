import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { dismissNotificationId } from "../../utils/notificationDismissals";
import "./InvitationDetail.css";

// Demo supplemental details — the real notification only carries the project
// title and sender, not a full brief, so this fills in the rest until a real
// per-invitation endpoint exists.
const DEMO_INVITE_DETAILS = {
  role: "Collaborator",
  teamStatus: "Forming",
  description:
    "You've been invited to join this project as a collaborator. Review the details below and accept or decline the invitation.",
  skills: ["Team Collaboration", "Communication"],
  techStack: ["To be discussed"],
};

// Fallback shown if this page is opened directly (e.g. a refresh), since the
// notification data normally arrives via navigation state.
const FALLBACK_NOTIFICATION = {
  _id: "demo-invite-1",
  project: { title: "EcoTrack — Carbon Footprint App" },
  sender: { fullName: "Alex Rivera" },
};

export default function InvitationDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = location.state?.notification || FALLBACK_NOTIFICATION;
  const senderName = notification.sender?.fullName || "A project owner";
  const projectTitle = notification.project?.title || "Untitled project";

  const initials =
    senderName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const [decision, setDecision] = useState(null);

  const handleDecision = (action) => {
    setDecision(action);
    dismissNotificationId(notification._id);
    // Real accept/reject endpoint for invites isn't wired up yet — this is a
    // frontend-only demo, so the decision just shows a confirmation, then
    // sends the user back to Posts on its own.
  };

  useEffect(() => {
    if (!decision) return undefined;
    const timer = window.setTimeout(() => navigate("/my-posts"), 2200);
    return () => window.clearTimeout(timer);
  }, [decision, navigate]);

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
                <span className="meta-value">{DEMO_INVITE_DETAILS.role}</span>
              </div>
              <div className="invitation-meta">
                <span className="meta-label">Team status</span>
                <span className="meta-value">{DEMO_INVITE_DETAILS.teamStatus}</span>
              </div>
            </div>

            <p className="invitation-description">{DEMO_INVITE_DETAILS.description}</p>

            <div className="invitation-chip-group">
              <span className="chip-group-label">Skills</span>
              <div className="chips">
                {DEMO_INVITE_DETAILS.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="invitation-chip-group">
              <span className="chip-group-label">Tech stack</span>
              <div className="chips">
                {DEMO_INVITE_DETAILS.techStack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>

            <div className="invitation-actions">
              <button
                type="button"
                className="invitation-reject-btn"
                onClick={() => handleDecision("rejected")}
              >
                Decline
              </button>
              <button
                type="button"
                className="invitation-accept-btn"
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
