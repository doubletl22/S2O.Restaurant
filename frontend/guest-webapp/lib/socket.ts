import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const url = (process.env.NEXT_PUBLIC_SOCKET_URL || "").trim();
  if (!url) return null;

  if (!socket) {
    socket = io(url, { transports: ["websocket"] });
  }
  return socket;
}
