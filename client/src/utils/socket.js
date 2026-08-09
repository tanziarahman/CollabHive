import { io } from "socket.io-client";
import { getToken } from "./session";

const socketURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

// Lazily creates a single shared, authenticated socket connection.
// The server's io.use() handshake middleware expects the JWT on auth.token.
export const getSocket = () => {
  if (socket) return socket;

  socket = io(socketURL, {
    auth: { token: getToken() },
    autoConnect: false,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
