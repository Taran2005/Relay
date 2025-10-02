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
    const initializeSocket = async () => {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");

        // Try to get authentication token, but don't fail if it's not available
        let token = null;
        try {
          const response = await fetch('/api/socket/auth');
          if (response.ok) {
            const data = await response.json();
            token = data.token;
          }
        } catch {
          // Proceed without auth if not available
        }

        const socketInstance = ClientIO(siteUrl, {
          path: "/api/socket/io",
          addTrailingSlash: false,
          transports: ['polling', 'websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          forceNew: false,
          auth: token ? { token } : {}
        });

        socketInstance.on("connect", () => {
          setIsConnected(true);
        }); socketInstance.on("disconnect", () => {
          setIsConnected(false);
        });

        socketInstance.on("connect_error", () => {
          setIsConnected(false);
        });

        socketInstance.on("error", () => {
          // Handle error silently
        });

        socketInstance.on("reconnect", () => {
          setIsConnected(true);
        });

        socketInstance.on("reconnect_attempt", () => {
          // Handle reconnect attempt
        });

        socketInstance.on("reconnect_error", () => {
          // Handle reconnect error
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
        };

      } catch {
        setIsConnected(false);
      }
    };

    initializeSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
