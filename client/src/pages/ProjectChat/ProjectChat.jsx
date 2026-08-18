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
    </>
  );
}
