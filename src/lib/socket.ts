import { Server as ServerIO } from "socket.io";

declare global {
  var io: ServerIO | undefined;
}

let io: ServerIO | null = null;

export const getSocketServer = () => {
  if (typeof window === 'undefined') {
    // Server side
    return global.io || io;
  }
  return io;
};

export const setSocketServer = (server: ServerIO) => {
  io = server;
  if (typeof window === 'undefined') {
    global.io = server;
  }
};