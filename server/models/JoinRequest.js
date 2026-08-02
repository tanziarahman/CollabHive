import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // The user who would join the project if this is accepted
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who created this: the applicant themselves (type 'request') or the project owner (type 'invite')
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['request', 'invite'],
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
