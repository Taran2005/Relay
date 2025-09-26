"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect in production or when explicitly using socket server
    const shouldConnect = process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true';

    if (!shouldConnect) {
      console.log("🔌 Socket.IO disabled in development. Use 'npm run dev:socket' to enable.");
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    console.log("🔌 Attempting to connect to Socket.IO at:", siteUrl);

    const socketInstance = ClientIO(siteUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      forceNew: false,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected successfully!", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error.message || error);
      setIsConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.log("❌ Socket error:", error);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("� Socket reconnected on attempt:", attemptNumber);
      setIsConnected(true);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    });

    socketInstance.on("reconnect_error", (error) => {
      console.log("❌ Reconnection error:", error);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Cleaning up socket connection");
      socketInstance.disconnect();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
