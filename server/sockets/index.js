import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Message from '../models/Message.js';
import { isProjectMember } from '../utils/projectAccess.js';
import { createNotification } from '../services/notificationService.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  // Authenticates the handshake the same way `protect` authenticates HTTP requests
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Not authorized, no token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Not authorized, user not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Not authorized, token failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_project_room', async ({ projectId }) => {
      try {
        const project = await Project.findById(projectId);
        if (!project) {
          return socket.emit('error_message', { message: 'Project not found' });
        }
        if (!isProjectMember(project, socket.user._id)) {
          return socket.emit('error_message', {
            message: 'Not authorized: you are not a member of this project',
          });
        }

        socket.join(`project:${projectId}`);
        socket.emit('joined_project_room', { projectId });
      } catch (error) {
        socket.emit('error_message', { message: error.message });
      }
    });

    // Re-checks membership on every message rather than trusting room membership alone,
    // since a user's project membership can change after they joined the room.
    socket.on('send_message', async ({ projectId, text }) => {
      try {
        if (!text || !text.trim()) {
          return socket.emit('error_message', { message: 'Message text is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
          return socket.emit('error_message', { message: 'Project not found' });
        }
        if (!isProjectMember(project, socket.user._id)) {
          return socket.emit('error_message', {
            message: 'Not authorized: you are not a member of this project',
          });
        }

        const message = await Message.create({
          project: projectId,
          sender: socket.user._id,
          text: text.trim(),
        });

        io.to(`project:${projectId}`).emit('new_message', {
          _id: message._id,
          project: message.project,
          text: message.text,
          createdAt: message.createdAt,
          sender: {
            _id: socket.user._id,
            fullName: socket.user.fullName,
            username: socket.user.username,
            profilePicture: socket.user.profilePicture,
          },
        });

        // Notify every other team member — the socket event only reaches people
        // with the chat open right now, so anyone not currently viewing it
        // needs a persistent notification to find out a message came in.
        const recipientIds = new Set([
          project.createdBy.toString(),
          ...project.members.map((m) => m.user.toString()),
        ]);
        recipientIds.delete(socket.user._id.toString());

        const preview = text.trim().slice(0, 80);
        await Promise.all(
          Array.from(recipientIds).map((recipientId) =>
            createNotification({
              recipient: recipientId,
              sender: socket.user._id,
              type: 'new_message',
              project: project._id,
              message: `${socket.user.fullName} sent a message in "${project.title}": ${preview}`,
            })
          )
        );
      } catch (error) {
        socket.emit('error_message', { message: error.message });
      }
    });
  });

  return io;
};
