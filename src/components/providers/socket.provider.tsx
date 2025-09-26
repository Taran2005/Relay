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
  isEnabled: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isEnabled: false,
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

  // Force disable Socket.IO in development by default  
  const isEnabled = process.env.NODE_ENV === 'production' ||
    (process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' && process.env.NODE_ENV !== 'development');

  useEffect(() => {
    // Only connect in production or when explicitly using socket server
    const shouldConnect = isEnabled;

    if (!shouldConnect) {
      console.log("🔌 Socket.IO disabled in development.");
      console.log("💡 Environment details:");
      console.log("   NODE_ENV:", process.env.NODE_ENV);
      console.log("   NEXT_PUBLIC_ENABLE_SOCKET:", process.env.NEXT_PUBLIC_ENABLE_SOCKET);
      console.log("   To enable: Set NEXT_PUBLIC_ENABLE_SOCKET=true and use 'npm run dev:socket'");
      setIsConnected(false);
      setSocket(null);
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
  }, [isEnabled]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isEnabled }}>
      {children}
    </SocketContext.Provider>
  )
}
