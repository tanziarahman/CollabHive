import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./ProjectChat.css";

// Demo data only — the real project/message backend isn't wired up yet, this
// page exists so the chat UI can be previewed on its own. "you" is always the
// current user in this mockup; everyone else is a canned collaborator.
const DEMO_PROJECT_TITLE = "EcoTrack — Carbon Footprint App";

const DEMO_COLLABORATORS = [
  { _id: "demo-u1", fullName: "Maria Chen", roleLabel: "Owner", profilePicture: "" },
  { _id: "demo-u2", fullName: "Alex Rivera", roleLabel: "Frontend Developer", profilePicture: "" },
  { _id: "demo-u3", fullName: "Sarah Kim", roleLabel: "UI/UX Designer", profilePicture: "" },
  { _id: "you", fullName: "You", roleLabel: "Backend Developer", profilePicture: "" },
];

const DEMO_REPLIES = [
  "Sounds good to me!",
  "Nice, I'll take a look at that today.",
  "Can we hop on a quick call about this?",
  "Agreed — let's go with that approach.",
  "Just pushed an update, can someone review?",
];

const now = Date.now();
const INITIAL_MESSAGES = [
  {
    _id: "m1",
    text: "Hey everyone! Excited to get started on this 🎉",
    sender: DEMO_COLLABORATORS[0],
    createdAt: new Date(now - 1000 * 60 * 22).toISOString(),
  },
  {
    _id: "m2",
    text: "Same here! I'll start on the onboarding flow mockups today.",
    sender: DEMO_COLLABORATORS[2],
    createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
  },
  {
    _id: "m3",
    text: "I'll set up the API routes for tracking entries.",
    sender: DEMO_COLLABORATORS[3],
    createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
  },
  {
    _id: "m4",
    text: "Nice, let me know when the endpoints are ready so I can wire up the app.",
    sender: DEMO_COLLABORATORS[1],
    createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
  },
];

export default function ProjectChat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const [showCallModal, setShowCallModal] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    const myMessage = {
      _id: `local-${Date.now()}`,
      text,
      sender: DEMO_COLLABORATORS[3],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, myMessage]);
    setMessageText("");

    // Simulated reply so the demo feels alive — not a real backend response.
    const replyDelay = 900 + Math.random() * 900;
    window.setTimeout(() => {
      const others = DEMO_COLLABORATORS.filter((c) => c._id !== "you");
      const replier = others[Math.floor(Math.random() * others.length)];
      const replyText = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        {
          _id: `local-reply-${Date.now()}`,
          text: replyText,
          sender: replier,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, replyDelay);
  };

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
              <h2>{DEMO_PROJECT_TITLE}</h2>
              <p>{DEMO_COLLABORATORS.length} collaborators</p>
            </div>

            <div className="project-chat-collaborators">
              {DEMO_COLLABORATORS.map((person) => (
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
                <h3>{DEMO_PROJECT_TITLE}</h3>
                <span className="project-chat-status">Demo preview — not connected to real data</span>
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
                const isMine = msg.sender?._id === "you";
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
              <h3>{DEMO_PROJECT_TITLE} — Group call</h3>
              <span className="project-chat-call-subtitle">Demo preview — no real audio or video</span>
            </div>

            <div className="project-chat-call-grid">
              {DEMO_COLLABORATORS.map((person) => {
                const isYou = person._id === "you";
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
