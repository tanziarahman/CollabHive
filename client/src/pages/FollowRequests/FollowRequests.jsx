import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getFollowRequests, respondToFollowRequest } from "../../api/users";
import { dismissFollowRequestFrom } from "../../utils/notificationDismissals";
import "./FollowRequests.css";

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const visibleRequests = searchTerm.trim()
    ? requests.filter((person) =>
        (person.fullName || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
    : requests;

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
      dismissFollowRequestFrom(person._id);
      setRequests((current) => current.filter((request) => request._id !== person._id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not respond to this request.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <>
      <Navbar hideSearch />
      <main className="follow-requests-page">
        <section className="requests-content">
          <p className="eyebrow">Your network</p>
          <h1>Follow requests</h1>
          <p className="requests-subtitle">{loading ? "Loading requests..." : `${requests.length} pending ${requests.length === 1 ? "request" : "requests"}`}</p>

          <div className="requests-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              placeholder="Search by name to see if they've sent you a request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error && <div className="requests-empty">{error}</div>}
          <div className="request-list">
            {!loading && !error && requests.length > 0 && visibleRequests.length === 0 && (
              <div className="requests-empty">No pending request from anyone matching “{searchTerm}”.</div>
            )}
            {visibleRequests.map((person) => (
              <article className="request-card" key={person._id}>
                <button
                  type="button"
                  className="request-card-photo"
                  onClick={() => navigate(`/profile/${person._id}`)}
                  aria-label={`View ${person.fullName}'s profile`}
                >
                  {person.profilePicture ? (
                    <img src={person.profilePicture} alt="" />
                  ) : (
                    <span className="request-card-initial">{person.fullName?.charAt(0)}</span>
                  )}
                </button>

                <div className="request-card-body">
                  <button type="button" className="request-card-name" onClick={() => navigate(`/profile/${person._id}`)}>
                    {person.fullName}
                  </button>
                  <p className="request-card-meta">
                    {(person.skills || []).slice(0, 2).join(" · ") || "Open to collaborate"}
                  </p>

                  <div className="request-card-actions">
                    <button
                      type="button"
                      className="request-confirm"
                      disabled={respondingId === person._id}
                      onClick={() => respond(person, "accept")}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="request-decline"
                      disabled={respondingId === person._id}
                      onClick={() => respond(person, "decline")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
