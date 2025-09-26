import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { setSocketServer } from "@/lib/socket";
import { NextApiResponseServerIo } from "@/types/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"],
      },
      transports: ['websocket', 'polling'], // Allow both websocket and polling
    });

    res.socket.server.io = io;
    setSocketServer(io);

    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
      });
    });
  }

  res.end();
};

export default ioHandler;
