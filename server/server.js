import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';
import authRoutes from './routes/authRoutes.js';
import configRoutes from './routes/configRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import joinRequestRoutes from './routes/joinRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
// Raised from the 100kb default so profile pictures (stored as base64 data URLs) fit.
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('🐝 CollabHive API is running...');
});

// Error Handler (must be last)
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
