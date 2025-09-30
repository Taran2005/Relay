"use client";

import { logger } from "@/lib/logger";
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    logger.socket.init(siteUrl);

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
      logger.socket.connect(socketInstance.id!);
      console.log('[SOCKET] Connected with ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      logger.socket.disconnect('socket', reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      logger.socket.error(error.message || error);
      setIsConnected(false);
    });

    socketInstance.on("error", (error) => {
      logger.socket.error(error);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      logger.socket.reconnected(attemptNumber);
      setIsConnected(true);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      logger.socket.reconnect(attemptNumber);
    });

    socketInstance.on("reconnect_error", (error) => {
      logger.socket.error(error);
    });

    setSocket(socketInstance);

    return () => {
      logger.socket.cleanup();
      socketInstance.disconnect();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
