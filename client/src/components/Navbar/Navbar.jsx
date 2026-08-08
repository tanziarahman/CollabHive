import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const NOTIF_CONFIG = {
  follow: {
    label: (n) => (
      <>
        <strong>{n.actorName}</strong> started following you
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
      </svg>
    ),
    className: "notif-follow",
  },
  hire: {
    label: (n) => (
      <>
        <strong>{n.actorName}</strong> hired you for <strong>{n.projectName}</strong>
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    className: "notif-hire",
  },
  applied: {
    label: (n) => (
      <>
        <strong>{n.actorName}</strong> applied to <strong>{n.projectName}</strong>
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
    className: "notif-applied",
  },
  invite: {
    label: (n) => (
      <>
        <strong>{n.actorName}</strong> invited you to collaborate on <strong>{n.projectName}</strong>
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    className: "notif-invite",
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "applied", actorName: "John", projectName: "E-commerce App", time: "2 min ago", unread: true },
    { id: 2, type: "hire", actorName: "Maria Chen", projectName: "Brand Identity Design", time: "1 hour ago", unread: true },
    { id: 3, type: "invite", actorName: "Sarah", projectName: "Mobile Banking App", time: "3 hours ago", unread: false },
    { id: 4, type: "follow", actorName: "Alex Rivera", time: "1 day ago", unread: false },
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <nav className="navbar">
      {/* Left side - Logo */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
          Collab<span>Hive</span>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="navbar-center">
        <form onSubmit={handleSearch} className="search-form">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7" />
            <line x1="15" y1="15" x2="21" y2="21" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search users or projects by skill or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right side - Actions */}
      <div className="navbar-right">
        {/* Create Project Button */}
        <button className="create-project-btn" onClick={() => navigate("/create-project")}>
          Post Project
        </button>

        {/* My Posts Button */}
        <button className="my-posts-btn" onClick={() => navigate("/my-posts")}>
          Posts
        </button>

        <button
          className="follow-requests-nav-btn"
          onClick={() => navigate("/follow-requests")}
          aria-label="View follow requests"
          title="Follow requests"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M16 11h6" />
          </svg>
        </button>

        {/* Notifications Bell */}
        <div className="notifications-container">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifications.some((n) => n.unread) && <span className="notification-badge"></span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <button className="mark-all-read" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const config = NOTIF_CONFIG[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.unread ? "unread" : ""}`}
                      >
                        <div className={`notification-icon ${config.className}`}>
                          {config.icon}
                        </div>
                        <div className="notification-body">
                          <div className="notification-text">{config.label(notif)}</div>
                          <div className="notification-time">{notif.time}</div>
                        </div>
                        {notif.unread && <span className="notification-dot"></span>}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-notifications">No notifications yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="profile-container">
          <button
            className="profile-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-name">{user.fullName || user.username || "User"}</div>
                <div className="profile-email">{user.email}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => navigate("/profile")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate("/settings")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}