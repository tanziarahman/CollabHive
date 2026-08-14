// Local-only notification dismissal tracking.
//
// There's no real "delete notification" backend endpoint, and demo
// notifications (like the sample invite) don't live in the database at all.
// So once a notification is resolved (accepted/declined/ignored) anywhere in
// the app, we remember it here (localStorage) and filter it out everywhere
// the notification list is loaded, even across page navigations.

const STORAGE_KEY = "collabhive_dismissed_notifications";

const readSet = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const writeSet = (set) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore storage failures (e.g. private browsing) — dismissal just won't persist.
  }
};

// A notification is hidden either because its own id was dismissed directly
// (cross button, inline accept/decline, the invite detail page), or — for
// follow requests specifically — because it was resolved from somewhere that
// doesn't have the notification id at hand, like the sender's profile page.
export const isNotificationDismissed = (notification) => {
  const dismissed = readSet();
  if (dismissed.has(notification._id)) return true;
  if (notification.type === "follow_request" && notification.sender?._id) {
    return dismissed.has(`follow_request:${notification.sender._id}`);
  }
  return false;
};

export const dismissNotificationId = (id) => {
  if (!id) return;
  const dismissed = readSet();
  dismissed.add(id);
  writeSet(dismissed);
};

export const dismissFollowRequestFrom = (senderId) => {
  if (!senderId) return;
  const dismissed = readSet();
  dismissed.add(`follow_request:${senderId}`);
  writeSet(dismissed);
};

// Read-state tracking for demo notifications only (ids starting with "demo-").
// Real notifications get their isRead status from the backend on every fetch,
// so they don't need this — but demo ones are hardcoded constants that would
// otherwise reset back to unread on every page load.
const READ_STORAGE_KEY = "collabhive_read_demo_notifications";

const readReadSet = () => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const writeReadSet = (set) => {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore storage failures — read state just won't persist.
  }
};

export const isDemoNotificationRead = (id) => readReadSet().has(id);

export const markDemoNotificationRead = (id) => {
  if (!id || !id.startsWith("demo-")) return;
  const read = readReadSet();
  read.add(id);
  writeReadSet(read);
};
