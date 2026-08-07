import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getFollowRequests, respondToFollowRequest } from "../../api/users";
import "./FollowRequests.css";

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setRequests(await getFollowRequests());
      } catch (err) {
        setError(err.response?.data?.message || "Could not load follow requests.");
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const respond = async (person, action) => {
    setRespondingId(person._id);
    try {
      await respondToFollowRequest(person._id, action);
      setRequests((current) => current.filter((request) => request._id !== person._id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not respond to this request.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="follow-requests-page">
        <section className="requests-content">
          <p className="eyebrow">Your network</p>
          <h1>Follow requests</h1>
          <p className="requests-subtitle">{loading ? "Loading requests..." : `${requests.length} pending ${requests.length === 1 ? "request" : "requests"}`}</p>
          {error && <div className="requests-empty">{error}</div>}
          <div className="request-list">
            {!loading && !error && requests.length === 0 && <div className="requests-empty">You’re all caught up. New follow requests will appear here.</div>}
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
                  <button className="request-decline" disabled={respondingId === person._id} onClick={() => respond(person, "decline")}>Delete</button>
                  <button className="request-confirm" disabled={respondingId === person._id} onClick={() => respond(person, "accept")}>Confirm</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
