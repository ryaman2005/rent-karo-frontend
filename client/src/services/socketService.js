import { io } from "socket.io-client";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function connectSocket(userId) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit("authenticate", userId);
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
