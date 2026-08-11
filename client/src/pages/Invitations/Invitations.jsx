import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getMyJoinRequests, acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import "./Invitations.css";

export default function Invitations() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const res = await getMyJoinRequests();
        const pendingInvites = (res.data || []).filter(
          (jr) => jr.type === "invite" && jr.status === "pending"
        );
        setInvitations(pendingInvites);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load invitations.");
      } finally {
        setLoading(false);
      }
    };
    loadInvitations();
  }, []);

  const respond = async (id, action) => {
    setRespondingId(id);
    try {
      if (action === "accept") {
        await acceptJoinRequest(id);
      } else {
        await rejectJoinRequest(id);
      }
      setInvitations((prev) => prev.filter((invitation) => invitation._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not respond to this invitation.");
    } finally {
      setRespondingId(null);
    }
  };

  const handleOwnerClick = (ownerId) => {
    navigate(`/profile/${ownerId}`);
  };

  return (
    <>
      <Navbar />

      <main className="invitations-page">
        <div className="invitations-container">

          {/* HEADER */}
          <div className="invitations-header">
            <div>
              <div className="header-label">
                COLLABORATION
              </div>

              <h1>Project Invitations</h1>

              <p>
                You've been invited to collaborate on these
                projects.
              </p>
            </div>

            <div className="invitation-counter">
              <span>{invitations.length}</span>
              <small>Pending</small>
            </div>
          </div>

          {error && <div className="empty-state"><p>{error}</p></div>}

          {loading ? (
            <div className="empty-state"><p>Loading invitations...</p></div>
          ) : !error && invitations.length > 0 ? (
            <div className="invitation-list">

              {invitations.map((invitation) => {
                const project = invitation.project || {};
                const members = project.members?.length || 0;
                const maxMembers = project.totalMembers || 0;

                return (
                  <article
                    className="invitation-card"
                    key={invitation._id}
                  >

                    {/* TOP SECTION */}
                    <div className="invitation-top">

                      {/* PROJECT */}
                      <div className="project-heading">
                        <div className="invitation-title">
                          <h2>{project.title}</h2>

                          <p>
                            You've been invited to join this
                            collaboration.
                          </p>
                        </div>
                      </div>

                      {/* OWNER */}
                      <div className="owner-section">
                        <div
                          className="owner-profile"
                          onClick={() =>
                            handleOwnerClick(
                              invitation.initiatedBy?._id
                            )
                          }
                        >
                          <div className="owner-avatar">
                            {invitation.initiatedBy?.fullName
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong className="owner-name">
                            {invitation.initiatedBy?.fullName}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* PROJECT DETAILS */}
                    <div className="invitation-details">

                      {/* ROLE */}
                      <div className="role-box">
                        <span className="detail-label">
                          INVITED ROLE
                        </span>

                        <strong>
                          {invitation.role}
                        </strong>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="project-info">
                        <span className="detail-label">
                          ABOUT THE PROJECT
                        </span>

                        <p>
                          {project.description}
                        </p>
                      </div>

                      {/* SKILLS + TECH STACK IN SAME BLOCK */}
                      <div className="skills-area">

                        <span className="detail-label">
                          SKILLS
                        </span>

                        <div className="skill-list">
                          {(project.skillsRequired || []).map(
                            (skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            )
                          )}
                        </div>

                        <span
                          className="detail-label"
                          style={{ marginTop: "0.8rem" }}
                        >
                          TECH STACK
                        </span>

                        <div className="skill-list">
                          {(project.techStack || []).map(
                            (tech) => (
                              <span key={tech}>
                                {tech}
                              </span>
                            )
                          )}
                        </div>

                      </div>

                    </div>

                    {/* BOTTOM */}
                    <div className="invitation-bottom">

                      <div className="team-summary">
                        <span>
                          {members}/
                          {maxMembers} members
                        </span>

                        <span className="summary-divider">
                          •
                        </span>

                        <span>
                          {maxMembers - members}{" "}
                          spot
                          {maxMembers - members !== 1
                            ? "s"
                            : ""}{" "}
                          available
                        </span>
                      </div>

                      <div className="invitation-actions">

                        <button
                          className="reject-btn"
                          disabled={respondingId === invitation._id}
                          onClick={() =>
                            respond(
                              invitation._id,
                              "reject"
                            )
                          }
                        >
                          Reject
                        </button>

                        <button
                          className="accept-btn"
                          disabled={respondingId === invitation._id}
                          onClick={() =>
                            respond(
                              invitation._id,
                              "accept"
                            )
                          }
                        >
                          Accept Invitation
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          ) : !error && (

            /* EMPTY STATE */
            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h2>You're all caught up</h2>

              <p>
                You don't have any pending project
                invitations right now.
              </p>

            </div>
          )}

        </div>
      </main>
    </>
  );
}
