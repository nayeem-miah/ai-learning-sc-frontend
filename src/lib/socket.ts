import { io, Socket } from "socket.io-client";

// Initialize socket connection

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://206.162.244.131:6210";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
});
