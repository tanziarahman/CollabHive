import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Maps a notification type to the settings toggle that controls it.
// Types with no entry here (e.g. new_project) are never gated.
const TYPE_TO_SETTING = {
  follow_request: 'notifyFollowRequests',
  follow_accepted: 'notifyFollowAccepted',
  join_request: 'notifyJoinRequests',
  invite: 'notifyJoinRequests',
  request_accepted: 'notifyJoinRequestUpdates',
  request_rejected: 'notifyJoinRequestUpdates',
  invite_accepted: 'notifyJoinRequestUpdates',
  invite_rejected: 'notifyJoinRequestUpdates',
};

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
    const settingKey = TYPE_TO_SETTING[type];
    if (settingKey) {
      const recipientUser = await User.findById(recipient).select('settings');
      if (recipientUser?.settings?.[settingKey] === false) {
        return; // Recipient opted out of this notification type.
      }
    }

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
