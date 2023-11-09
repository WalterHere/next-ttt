import type { Server as HTTPServer, IncomingMessage } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

interface RequestWithQuery extends IncomingMessage {
  _query: { username: string };
}

let roomNumber = 0;
const rooms = new Map<string, Array<{ id: string; username: string }>>();

export default function SocketHandler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log("socket.io already running");
  } else {
    console.log("Starting Socket.IO server");

    const io = new Server(res.socket.server);

    io.on("connect", async (socket) => {
      socket.on("login", (username) => {
        const roomUsers = rooms.get("main" + roomNumber) ?? [];

        if (roomUsers) {
          if (roomUsers.findIndex((item) => item.id === socket.id) === -1) {
            if (roomUsers.length === 2) {
              roomNumber++;

              rooms.set("main" + roomNumber, [{ id: socket.id, username }]);

              socket.join("main" + roomNumber);
            } else {
              rooms.set("main" + roomNumber, [
                ...roomUsers,
                { id: socket.id, username },
              ]);

              socket.join("main" + roomNumber);

              if (roomUsers.length === 1) {
                io.to("main" + roomNumber).emit("onStart", {
                  room: "main" + roomNumber,
                  firstTurn: roomUsers[0].username,
                });
              }
            }
          }
        }
      });

      socket.on("draw", ({ row, col, status, room }) => {
        console.log({ row, col, status, room });

        io.to(room).emit("onDraw", { row, col, status });
      });

      socket.on("disconnect", (reason) => {
        const username = (socket.request as RequestWithQuery)._query.username;

        rooms.forEach((item, key) => {
          if (item.findIndex((item) => item.username === username) !== -1) {
            rooms.delete(key);
          }
        });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
