import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getProjectById, getProjectMessages } from "../../api/projects";
import { getSocket, disconnectSocket } from "../../utils/socket";
import { getStoredUser } from "../../utils/session";
import "./ProjectChat.css";

export default function ProjectChat() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const myId = getStoredUser()?._id;

  const [projectTitle, setProjectTitle] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const [showCallModal, setShowCallModal] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [projectRes, messagesRes] = await Promise.all([
          getProjectById(projectId),
          getProjectMessages(projectId),
        ]);
        if (!active) return;

        const project = projectRes.data;
        setProjectTitle(project.title);

        const owner = project.createdBy
          ? [{ ...project.createdBy, roleLabel: "Owner" }]
          : [];
        const members = (project.members || [])
          .filter((m) => m.user)
          .map((m) => ({ ...m.user, roleLabel: m.role }));
        setCollaborators([...owner, ...members]);
        setMessages(messagesRes.data || []);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Could not load this chat.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();

    const socket = getSocket();
    socket.connect();
    socket.emit("join_project_room", { projectId });

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    const handleErrorMessage = (err) => {
      setError(err.message || "Something went wrong.");
    };

    socket.on("new_message", handleNewMessage);
    socket.on("error_message", handleErrorMessage);

    return () => {
      active = false;
      socket.off("new_message", handleNewMessage);
      socket.off("error_message", handleErrorMessage);
      disconnectSocket();
    };
  }, [projectId]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    getSocket().emit("send_message", { projectId, text });
    setMessageText("");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="project-chat-page">
          <div className="loading-state">Loading chat...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="project-chat-page">
        <div className="project-chat-shell">
          {/* Left: collaborators */}
          <aside className="project-chat-sidebar">
            <button type="button" className="project-chat-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>

            <div className="project-chat-sidebar-header">
              <h2>{projectTitle}</h2>
              <p>{collaborators.length} collaborators</p>
            </div>

            <div className="project-chat-collaborators">
              {collaborators.map((person) => (
                <div className="project-chat-collaborator" key={person._id}>
                  <span className="project-chat-collaborator-avatar">
                    {person.profilePicture ? (
                      <img src={person.profilePicture} alt="" />
                    ) : (
                      person.fullName?.charAt(0)
                    )}
                  </span>
                  <span className="project-chat-collaborator-info">
                    <span className="project-chat-collaborator-name">{person.fullName}</span>
                    <span className="project-chat-collaborator-role">{person.roleLabel}</span>
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Right: messages */}
          <section className="project-chat-main">
            <div className="project-chat-header">
              <div>
                <h3>{projectTitle}</h3>
                {error && <span className="project-chat-status">{error}</span>}
              </div>
              <button
                type="button"
                className="project-chat-call-trigger"
                onClick={() => setShowCallModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Group call
              </button>
            </div>

            <div className="project-chat-messages">
              {messages.map((msg) => {
                const isMine = msg.sender?._id === myId;
                return (
                  <div key={msg._id} className={`project-chat-message ${isMine ? "mine" : ""}`}>
                    {!isMine && (
                      <span className="project-chat-message-avatar">
                        {msg.sender?.profilePicture ? (
                          <img src={msg.sender.profilePicture} alt="" />
                        ) : (
                          msg.sender?.fullName?.charAt(0)
                        )}
                      </span>
                    )}
                    <div className="project-chat-bubble">
                      {!isMine && (
                        <div className="project-chat-message-sender">{msg.sender?.fullName}</div>
                      )}
                      <div className="project-chat-message-text">{msg.text}</div>
                      <div className="project-chat-message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="project-chat-composer" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" disabled={!messageText.trim()}>
                Send
              </button>
            </form>
          </section>
        </div>
      </div>

      {showCallModal && (
        <div className="project-chat-call-overlay" onClick={() => setShowCallModal(false)}>
          <div
            className="project-chat-call-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-chat-call-header">
              <h3>{projectTitle} — Group call</h3>
              <span className="project-chat-call-subtitle">Demo preview — no real audio or video</span>
            </div>

            <div className="project-chat-call-grid">
              {collaborators.map((person) => {
                const isYou = person._id === myId;
                return (
                  <div className="project-chat-call-tile" key={person._id}>
                    <div className={`project-chat-call-avatar ${isYou && cameraOff ? "" : "live"}`}>
                      {person.profilePicture ? (
                        <img src={person.profilePicture} alt="" />
                      ) : (
                        person.fullName?.charAt(0)
                      )}
                    </div>
                    <div className="project-chat-call-name">
                      {isYou ? "You" : person.fullName}
                      {isYou && micMuted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2M19 10v2a7 7 0 0 1-.11 1.23" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="project-chat-call-controls">
              <button
                type="button"
                className={`project-chat-call-control ${micMuted ? "off" : ""}`}
                onClick={() => setMicMuted((m) => !m)}
                title={micMuted ? "Unmute" : "Mute"}
              >
                {micMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2M19 10v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className={`project-chat-call-control ${cameraOff ? "off" : ""}`}
                onClick={() => setCameraOff((c) => !c)}
                title={cameraOff ? "Turn camera on" : "Turn camera off"}
              >
                {cameraOff ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                    <path d="M9 5h5a2 2 0 0 1 2 2v3.5l4.29-4.3a.5.5 0 0 1 .71.36v10.88a.5.5 0 0 1-.71.35L16 13.5" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className="project-chat-call-leave"
                onClick={() => setShowCallModal(false)}
              >
                Leave call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
