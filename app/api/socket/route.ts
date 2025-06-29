import type { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"

let io: SocketIOServer

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = new HTTPServer()
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      socket.on("join-broadcast", (broadcastId) => {
        socket.join(broadcastId)
        socket.to(broadcastId).emit("user-joined", socket.id)
      })

      socket.on("signal", ({ signal, peerId, broadcastId }) => {
        socket.to(broadcastId).emit("signal", { signal, peerId: socket.id })
      })

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
        socket.broadcast.emit("user-left", socket.id)
      })
    })
  }

  return new Response("Socket.IO server running", { status: 200 })
}
