import Notification from '../models/Notification.js';

// Notifications are a side effect, not the primary operation: a failure here
// must never block or roll back the action (join request, follow, etc.) that
// triggered it, so errors are caught and logged rather than thrown.
export const createNotification = async ({
  recipient,
  sender,
  type,
  project,
  relatedJoinRequest,
  message,
}) => {
  try {
    await Notification.create({
      recipient,
      sender,
      type,
      project,
      relatedJoinRequest,
      message,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
