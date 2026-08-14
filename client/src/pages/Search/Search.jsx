import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { searchUsers, sendFollowRequest } from "../../api/users";
import "./Search.css";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await searchUsers({ query: trimmed });
        setResults(data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Could not search users.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  const handleFollow = async (person) => {
    setSendingId(person._id);
    try {
      await sendFollowRequest(person._id);
      setResults((prev) =>
        prev.map((p) => (p._id === person._id ? { ...p, relationship: "requested" } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not send follow request.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <>
      <Navbar searchValue={query} onSearchChange={setQuery} />
      <main className="search-page">
        <div className="search-container">
          <p className="search-eyebrow">Discover</p>
          <h1>Search people</h1>

          {!query.trim() ? (
            <p className="search-hint">Start typing a name or username above to find people.</p>
          ) : loading ? (
            <p className="search-hint">Searching...</p>
          ) : error ? (
            <p className="search-hint">{error}</p>
          ) : results.length === 0 ? (
            <p className="search-hint">No one found matching &ldquo;{query}&rdquo;.</p>
          ) : (
            <div className="search-results">
              {results.map((person) => (
                <article className="search-result-card" key={person._id}>
                  <button
                    type="button"
                    className="search-result-avatar"
                    onClick={() => navigate(`/profile/${person._id}`)}
                    aria-label={`View ${person.fullName}'s profile`}
                  >
                    {person.profilePicture ? (
                      <img src={person.profilePicture} alt="" />
                    ) : (
                      <span>{person.fullName?.charAt(0)}</span>
                    )}
                  </button>

                  <div className="search-result-body">
                    <button
                      type="button"
                      className="search-result-name"
                      onClick={() => navigate(`/profile/${person._id}`)}
                    >
                      {person.fullName}
                    </button>
                    <p className="search-result-meta">
                      @{person.username}
                      {(person.skills || []).length > 0
                        ? ` · ${person.skills.slice(0, 3).join(" · ")}`
                        : ""}
                    </p>
                  </div>

                  <div className="search-result-actions">
                    <button
                      type="button"
                      className="search-result-view"
                      onClick={() => navigate(`/profile/${person._id}`)}
                    >
                      View profile
                    </button>

                    {person.relationship === "following" ? (
                      <span className="search-result-status">Following</span>
                    ) : person.relationship === "requested" ? (
                      <span className="search-result-status">Requested</span>
                    ) : person.relationship === "incoming" ? (
                      <button
                        type="button"
                        className="search-result-follow"
                        onClick={() => navigate("/follow-requests")}
                      >
                        Respond to request
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="search-result-follow"
                        disabled={sendingId === person._id}
                        onClick={() => handleFollow(person)}
                      >
                        {sendingId === person._id ? "Sending..." : "Follow"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
