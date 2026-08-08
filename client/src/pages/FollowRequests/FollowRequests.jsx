import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./FollowRequests.css";

const demoRequests = [
  { _id: "demo-1", fullName: "Alex Mercer", username: "alexmercer", skills: ["React", "Node.js"] },
  { _id: "demo-2", fullName: "Sarah Jenkins", username: "sarahjenkins", skills: ["React", "TypeScript"] },
  { _id: "demo-3", fullName: "David Chen", username: "davidchen", skills: ["Node.js", "MongoDB"] },
];

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/follow-requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error();
        setRequests(await response.json());
      } catch {
        setRequests(demoRequests);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const respond = async (person, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/follow-requests/${person._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error();
    } catch {
      // Keep the demo screen responsive when the API is unavailable.
    }
    setRequests((current) => current.filter((request) => request._id !== person._id));
  };

  return (
    <>
      <Navbar />
      <main className="follow-requests-page">
        <section className="requests-content">
          <p className="eyebrow">Your network</p>
          <h1>Follow requests</h1>
          <p className="requests-subtitle">{loading ? "Loading requests..." : `${requests.length} pending ${requests.length === 1 ? "request" : "requests"}`}</p>
          <div className="request-list">
            {!loading && requests.length === 0 && <div className="requests-empty">You’re all caught up. New follow requests will appear here.</div>}
            {requests.map((person) => (
              <article className="request-card" key={person._id}>
                <button className="person-avatar" onClick={() => navigate(`/profile/${person._id}`)} aria-label={`View ${person.fullName}'s profile`}>
                  {person.profilePicture ? <img src={person.profilePicture} alt="" /> : person.fullName?.charAt(0)}
                </button>
                <div className="request-person">
                  <button className="person-name" onClick={() => navigate(`/profile/${person._id}`)}>{person.fullName}</button>
                  <p>@{person.username || "collabhive"}</p>
                  <span>{(person.skills || []).slice(0, 3).join(" · ") || "Open to collaborate"}</span>
                </div>
                <div className="request-actions">
                  <button className="request-decline" onClick={() => respond(person, "decline")}>Delete</button>
                  <button className="request-confirm" onClick={() => respond(person, "accept")}>Confirm</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
