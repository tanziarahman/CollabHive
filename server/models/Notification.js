import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'join_request',
        'invite',
        'request_accepted',
        'request_rejected',
        'invite_accepted',
        'invite_rejected',
        'follow_request',
        'follow_accepted',
        'new_project',
        'project_comment',
      ],
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    relatedJoinRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JoinRequest',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
