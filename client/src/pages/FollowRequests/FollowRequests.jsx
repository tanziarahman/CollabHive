import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getFollowRequests, getSuggestions, respondToFollowRequest, searchUsers, sendFollowRequest } from "../../api/users";
import { dismissFollowRequestFrom } from "../../utils/notificationDismissals";
import "./FollowRequests.css";

export default function FollowRequests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [sendingId, setSendingId] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [followingSuggestionId, setFollowingSuggestionId] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setRequests(await getFollowRequests());
      } catch (err) {
        setRequestsError(err.response?.data?.message || "Could not load follow requests.");
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setSuggestions(await getSuggestions());
      } catch {
        setSuggestions([]);
      }
    };
    loadSuggestions();
  }, []);

  const handleFollowSuggestion = async (person) => {
    setFollowingSuggestionId(person._id);
    try {
      await sendFollowRequest(person._id);
      setSuggestions((items) => items.filter((item) => item._id !== person._id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not send follow request.");
    } finally {
      setFollowingSuggestionId(null);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return undefined;
    }

    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await searchUsers({ query: trimmed });
        setSearchResults(data);
        setSearchError("");
      } catch (err) {
        setSearchError(err.response?.data?.message || "Could not search users.");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

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

  const handleFollow = async (person) => {
    setSendingId(person._id);
    try {
      await sendFollowRequest(person._id);
      setSearchResults((prev) =>
        prev.map((p) => (p._id === person._id ? { ...p, relationship: "requested" } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not send follow request.");
    } finally {
      setSendingId(null);
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <>
      <Navbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search people by name or username..."
      />
      <main className="follow-requests-page">
        <section className="requests-content">
          <p className="eyebrow">Connect</p>
          <h1>Find people</h1>
          <p className="requests-subtitle">
            Search for someone by name or username to view their profile or send a follow request.
          </p>

          {!isSearching && suggestions.length > 0 && (
            <section className="suggestions-section" aria-labelledby="suggestions-heading">
              <div className="suggestions-heading">
                <div>
                  <p className="suggestions-eyebrow">Suggested connections</p>
                  <h2 id="suggestions-heading">People you might want to collaborate with</h2>
                </div>
              </div>
              <div className="suggestion-grid">
                {suggestions.map((person) => (
                  <article className="suggestion-card" key={person._id}>
                    <button className="suggestion-avatar" onClick={() => navigate(`/profile/${person._id}`)} aria-label={`View ${person.fullName}'s profile`}>
                      {person.profilePicture ? <img src={person.profilePicture} alt="" /> : person.fullName?.charAt(0)}
                    </button>
                    <p className="suggestion-role">{person.experienceLevel || "Community member"}</p>
                    <h3>{person.fullName}</h3>
                    <p className="suggestion-handle">@{person.username || "collabhive"}</p>
                    <div className="skill-panel"><span>Top skills</span><p>{(person.skills || []).slice(0, 3).join(" · ") || "Open to collaborate"}</p></div>
                    <div className="suggestion-actions">
                      <button className="view-profile-btn" onClick={() => navigate(`/profile/${person._id}`)}>View profile</button>
                      <button className="follow-btn" disabled={followingSuggestionId === person._id} onClick={() => handleFollowSuggestion(person)}>
                        {followingSuggestionId === person._id ? "Sending..." : "Follow"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {isSearching ? (
            searching ? (
              <div className="requests-empty">Searching...</div>
            ) : searchError ? (
              <div className="requests-empty">{searchError}</div>
            ) : searchResults.length === 0 ? (
              <div className="requests-empty">No one found matching &ldquo;{query}&rdquo;.</div>
            ) : (
              <div className="request-list">
                {searchResults.map((person) => (
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
                        @{person.username}
                        {(person.skills || []).length > 0
                          ? ` · ${person.skills.slice(0, 2).join(" · ")}`
                          : ""}
                      </p>

                      <div className="request-card-actions">
                        <button type="button" className="request-decline" onClick={() => navigate(`/profile/${person._id}`)}>
                          View profile
                        </button>

                        {person.relationship === "following" ? (
                          <span className="request-status">Following</span>
                        ) : person.relationship === "requested" ? (
                          <span className="request-status">Requested</span>
                        ) : person.relationship === "incoming" ? (
                          <button type="button" className="request-confirm" onClick={() => setQuery("")}>
                            Respond below
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="request-confirm"
                            disabled={sendingId === person._id}
                            onClick={() => handleFollow(person)}
                          >
                            {sendingId === person._id ? "Sending..." : "Follow"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <>
              {requestsError && <div className="requests-empty">{requestsError}</div>}
              {loadingRequests ? (
                <div className="requests-empty">Loading requests...</div>
              ) : !requestsError && requests.length === 0 ? (
                <div className="requests-empty">
                  No pending follow requests. Search for people above to connect.
                </div>
              ) : (
                !requestsError && (
                  <>
                    <h2 className="section-label">Pending requests</h2>
                    <div className="request-list">
                      {requests.map((person) => (
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
                  </>
                )
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
