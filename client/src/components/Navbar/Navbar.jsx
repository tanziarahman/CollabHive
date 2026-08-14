import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../api/notifications";
import { respondToFollowRequest } from "../../api/users";
import { acceptJoinRequest, rejectJoinRequest } from "../../api/joinRequests";
import { clearSession } from "../../utils/session";
import {
  isNotificationDismissed,
  dismissNotificationId,
} from "../../utils/notificationDismissals";
import "./Navbar.css";

// Maps the backend's real notification types to an icon + color category.
const NOTIF_STYLES = {
  follow_request: {
    className: "notif-follow",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
      </svg>
    ),
  },

  follow_accepted: {
    className: "notif-follow",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="17 8 19 10 23 6" />
      </svg>
    ),
  },

  join_request: {
    className: "notif-applied",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },

  new_project: {
    className: "notif-applied",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },

  invite: {
    className: "notif-invite",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },

  request_accepted: {
    className: "notif-hire",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },

  invite_accepted: {
    className: "notif-hire",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },

  request_rejected: {
    className: "notif-rejected",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },

  invite_rejected: {
    className: "notif-rejected",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

const DEFAULT_NOTIF_STYLE = {
  className: "notif-follow",
  icon: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

export default function Navbar({ hideSearch = false, searchValue, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Pages that want live search results (e.g. Posts) pass searchValue +
  // onSearchChange and control the query themselves. Pages that don't
  // fall back to this internal state and the old navigate-to-/search behavior.
  const isControlledSearch = onSearchChange !== undefined;
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = isControlledSearch ? searchValue : internalSearchQuery;
  const setSearchQuery = isControlledSearch ? onSearchChange : setInternalSearchQuery;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [respondingId, setRespondingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications((res.data || []).filter((n) => !isNotificationDismissed(n)));
      } catch {
        // Leave the bell empty if notifications can't be loaded.
      }
    };

    loadNotifications();
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifications((show) => !show);
  };

  const handleNotificationClick = async (notification) => {
    if (notification.isRead) return;

    setNotifications((items) =>
      items.map((n) =>
        n._id === notification._id ? { ...n, isRead: true } : n
      )
    );

    try {
      await markAsRead(notification._id);
    } catch {
      // Non-critical; the badge will just be slightly stale until next reload.
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((items) =>
      items.map((n) => ({ ...n, isRead: true }))
    );

    try {
      await markAllAsRead();
    } catch {
      // Non-critical; the badge will just be slightly stale until next reload.
    }
  };

  const handleFollowRespond = async (e, notification, action) => {
    e.stopPropagation();
    const senderId = notification.sender?._id || notification.sender;
    if (!senderId) return;

    setRespondingId(notification._id);
    try {
      await respondToFollowRequest(senderId, action);
      dismissNotificationId(notification._id);
      setNotifications((items) =>
        items.filter((n) => n._id !== notification._id)
      );
    } catch {
      // Non-critical; leave the notification as-is so the user can retry.
    } finally {
      setRespondingId(null);
    }
  };

  const handleInviteRespond = async (e, notification, action) => {
    e?.stopPropagation?.();
    if (!notification.relatedJoinRequest) return;

    setRespondingId(notification._id);
    try {
      if (action === "accepted") {
        await acceptJoinRequest(notification.relatedJoinRequest);
      } else {
        await rejectJoinRequest(notification.relatedJoinRequest);
      }
      dismissNotificationId(notification._id);
      setNotifications((items) =>
        items.filter((n) => n._id !== notification._id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not respond to this invite.");
    } finally {
      setRespondingId(null);
    }
  };

  const handleDismissNotification = (e, notification) => {
    e.stopPropagation();
    dismissNotificationId(notification._id);
    setNotifications((items) =>
      items.filter((n) => n._id !== notification._id)
    );
  };

  const handleOpenInviteDetails = (notification) => {
    handleNotificationClick(notification);
    setShowNotifications(false);
    navigate(`/invitations/${notification._id}`, { state: { notification } });
  };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Controlled pages (e.g. Posts) filter live as the user types, so
    // submitting the form doesn't need to do anything else.
    if (isControlledSearch) return;

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
    <nav className="navbar">
      {/* Left side - Logo */}
      <div className="navbar-left">
        <div
          className="navbar-logo"
          onClick={() => navigate("/my-posts")}
        >
          Collab<span>Hive</span>
        </div>
      </div>

      {/* Center - Search Bar */}
      {!hideSearch && (
        <div className="navbar-center">
          <form onSubmit={handleSearch} className="search-form">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
      )}

      {/* Right side - Actions */}
      <div className="navbar-right">

        {/* Create Project Button */}
        <button
          className={`my-posts-btn ${location.pathname === "/create-project" ? "active" : ""}`}
          onClick={() => navigate("/create-project")}
        >
          Project
        </button>

        {/* My Posts Button */}
        <button
          className={`my-posts-btn ${location.pathname === "/my-posts" ? "active" : ""}`}
          onClick={() => navigate("/my-posts")}
        >
          Posts
        </button>

        {/* Follow Requests */}
        <button
          className={`follow-requests-nav-btn ${location.pathname === "/follow-requests" ? "active" : ""}`}
          onClick={() => navigate("/follow-requests")}
          aria-label="View follow requests"
          title="Follow requests"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M16 11h6" />
          </svg>
        </button>

        {/* Notifications Bell */}
        <div className="notifications-container">
          <button
            className="notification-btn"
            onClick={handleOpenNotifications}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {notifications.some((n) => !n.isRead) && (
              <span className="notification-badge"></span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>

                {notifications.length > 0 && (
                  <button
                    className="mark-all-read"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const style =
                      NOTIF_STYLES[notif.type] || DEFAULT_NOTIF_STYLE;

                    return (
                      <div
                        key={notif._id}
                        className={`notification-item ${
                          !notif.isRead ? "unread" : ""
                        }`}
                        onClick={() =>
                          notif.type === "invite"
                            ? handleOpenInviteDetails(notif)
                            : handleNotificationClick(notif)
                        }
                      >
                        <div
                          className={`notification-icon ${style.className}`}
                        >
                          {style.icon}
                        </div>

                        <div className="notification-body">
                          <div className="notification-text">
                            {notif.message}
                          </div>

                          <div className="notification-time">
                            {new Date(
                              notif.createdAt
                            ).toLocaleString()}
                          </div>

                          {notif.type === "follow_request" && (
                            <div className="notification-actions">
                              <button
                                type="button"
                                className="notif-action-accept"
                                disabled={respondingId === notif._id}
                                onClick={(e) =>
                                  handleFollowRespond(e, notif, "accept")
                                }
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="notif-action-decline"
                                disabled={respondingId === notif._id}
                                onClick={(e) =>
                                  handleFollowRespond(e, notif, "decline")
                                }
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {notif.type === "invite" && (
                            <div className="notification-actions">
                              <button
                                type="button"
                                className="notif-action-decline"
                                onClick={(e) =>
                                  handleInviteRespond(e, notif, "rejected")
                                }
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                className="notif-action-accept"
                                onClick={(e) =>
                                  handleInviteRespond(e, notif, "accepted")
                                }
                              >
                                Accept
                              </button>
                            </div>
                          )}
                        </div>

                        {!notif.isRead && (
                          <span className="notification-dot"></span>
                        )}

                        <button
                          type="button"
                          className="notification-dismiss"
                          aria-label="Dismiss notification"
                          title="Dismiss"
                          onClick={(e) => handleDismissNotification(e, notif)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-notifications">
                    No notifications yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="profile-container">
          <button
            className="profile-avatar"
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
          >
            {user.fullName
              ? user.fullName.charAt(0).toUpperCase()
              : user.email?.charAt(0).toUpperCase() || "U"}
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-name">
                  {user.fullName || user.username || "User"}
                </div>

                <div className="profile-email">
                  {user.email}
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item"
                onClick={() => navigate("/profile")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>

              <button
                className="dropdown-item"
                onClick={() => navigate("/settings")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 1 3 12a2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82A1.65 1.65 0 0 0 19.4 10H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
    </>
  );
}

