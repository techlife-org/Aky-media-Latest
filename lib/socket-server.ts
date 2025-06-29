import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
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

  return io
}
