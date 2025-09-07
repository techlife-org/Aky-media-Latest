import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import { connectToDatabase } from "./mongodb"
import type { BroadcastSession, ChatMessage, Reaction } from "@/models/BroadcastAdmin"

interface ConnectedUser {
  id: string
  broadcastId: string
  userName: string
  isHost: boolean
  joinedAt: Date
  lastSeen: Date
}

const connectedUsers = new Map<string, ConnectedUser>()
const broadcastRooms = new Map<string, Set<string>>()

export function initializeEnhancedSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    // Join broadcast room
    socket.on("join-broadcast", async (data) => {
      try {
        const { broadcastId, isHost, userName } = data
        
        // Add user to room
        socket.join(broadcastId)
        
        // Track connected user
        const user: ConnectedUser = {
          id: socket.id,
          broadcastId,
          userName,
          isHost,
          joinedAt: new Date(),
          lastSeen: new Date()
        }
        
        connectedUsers.set(socket.id, user)
        
        // Add to broadcast room tracking
        if (!broadcastRooms.has(broadcastId)) {
          broadcastRooms.set(broadcastId, new Set())
        }
        broadcastRooms.get(broadcastId)?.add(socket.id)
        
        // Update database
        await updateBroadcastParticipants(broadcastId)
        
        // Notify others in the room
        socket.to(broadcastId).emit("user-joined", {
          peerId: socket.id,
          userName,
          isHost,
          joinedAt: user.joinedAt
        })
        
        // Send current participants to new user
        const roomUsers = Array.from(broadcastRooms.get(broadcastId) || [])
          .map(id => connectedUsers.get(id))
          .filter(Boolean)
        
        socket.emit("participants-list", roomUsers)
        
        console.log(`User ${userName} joined broadcast ${broadcastId}`)
      } catch (error) {
        console.error("Join broadcast error:", error)
        socket.emit("error", { message: "Failed to join broadcast" })
      }
    })

    // Handle WebRTC signaling
    socket.on("signal", ({ signal, peerId, broadcastId, targetPeerId }) => {
      if (targetPeerId) {
        // Direct peer-to-peer signaling
        socket.to(targetPeerId).emit("signal", {
          signal,
          peerId: socket.id,
          broadcastId
        })
      } else {
        // Broadcast to room
        socket.to(broadcastId).emit("signal", {
          signal,
          peerId: socket.id,
          broadcastId
        })
      }
    })

    // Handle chat messages
    socket.on("chat-message", async (data) => {
      try {
        const { broadcastId, message, userName } = data
        const user = connectedUsers.get(socket.id)
        
        if (!user || user.broadcastId !== broadcastId) {
          socket.emit("error", { message: "Not authorized for this broadcast" })
          return
        }
        
        const chatMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 15),
          broadcastId,
          participantId: socket.id,
          participantName: userName,
          message,
          type: 'message',
          timestamp: new Date(),
          isDeleted: false
        }
        
        // Save to database
        await saveChatMessage(chatMessage)
        
        // Broadcast to room
        io.to(broadcastId).emit("chat-message", chatMessage)
        
        console.log(`Chat message from ${userName} in ${broadcastId}: ${message}`)
      } catch (error) {
        console.error("Chat message error:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle reactions
    socket.on("reaction", async (data) => {
      try {
        const { broadcastId, emoji, userName } = data
        const user = connectedUsers.get(socket.id)
        
        if (!user || user.broadcastId !== broadcastId) {
          socket.emit("error", { message: "Not authorized for this broadcast" })
          return
        }
        
        const reaction: Reaction = {
          id: Math.random().toString(36).substring(2, 15),
          broadcastId,
          participantId: socket.id,
          participantName: userName,
          emoji,
          timestamp: new Date()
        }
        
        // Save to database
        await saveReaction(reaction)
        
        // Broadcast to room
        io.to(broadcastId).emit("reaction", reaction)
        
        console.log(`Reaction ${emoji} from ${userName} in ${broadcastId}`)
      } catch (error) {
        console.error("Reaction error:", error)
        socket.emit("error", { message: "Failed to send reaction" })
      }
    })

    // Handle media status updates
    socket.on("media-status", (data) => {
      const { broadcastId, type, enabled } = data
      const user = connectedUsers.get(socket.id)
      
      if (user && user.broadcastId === broadcastId) {
        socket.to(broadcastId).emit("participant-media-update", {
          peerId: socket.id,
          userName: user.userName,
          type,
          enabled
        })
      }
    })

    // Handle participant updates
    socket.on("participant-update", (data) => {
      const { broadcastId, update } = data
      const user = connectedUsers.get(socket.id)
      
      if (user && user.broadcastId === broadcastId) {
        socket.to(broadcastId).emit("participant-update", {
          peerId: socket.id,
          userName: user.userName,
          update
        })
      }
    })

    // Handle ping for connection quality monitoring
    socket.on("ping", (data) => {
      const user = connectedUsers.get(socket.id)
      if (user) {
        user.lastSeen = new Date()
        socket.emit("pong", { timestamp: Date.now() })
      }
    })

    // Handle host controls
    socket.on("host-control", async (data) => {
      try {
        const { broadcastId, action, targetPeerId } = data
        const user = connectedUsers.get(socket.id)
        
        if (!user || !user.isHost || user.broadcastId !== broadcastId) {
          socket.emit("error", { message: "Not authorized for host controls" })
          return
        }
        
        switch (action) {
          case 'mute-participant':
            socket.to(targetPeerId).emit("host-mute", { broadcastId })
            break
          case 'remove-participant':
            socket.to(targetPeerId).emit("host-remove", { broadcastId })
            break
          case 'end-broadcast':
            io.to(broadcastId).emit("broadcast-ended", { broadcastId })
            await endBroadcast(broadcastId)
            break
        }
      } catch (error) {
        console.error("Host control error:", error)
        socket.emit("error", { message: "Failed to execute host control" })
      }
    })

    // Handle disconnection
    socket.on("disconnect", async () => {
      try {
        const user = connectedUsers.get(socket.id)
        
        if (user) {
          const { broadcastId, userName, isHost } = user
          
          // Remove from tracking
          connectedUsers.delete(socket.id)
          broadcastRooms.get(broadcastId)?.delete(socket.id)
          
          // Update database
          await updateBroadcastParticipants(broadcastId)
          
          // Notify others
          socket.to(broadcastId).emit("user-left", {
            peerId: socket.id,
            userName,
            isHost
          })
          
          console.log(`User ${userName} left broadcast ${broadcastId}`)
          
          // If host disconnected, handle broadcast cleanup
          if (isHost) {
            const remainingUsers = broadcastRooms.get(broadcastId)?.size || 0
            if (remainingUsers === 0) {
              await endBroadcast(broadcastId)
            }
          }
        }
        
        console.log("User disconnected:", socket.id)
      } catch (error) {
        console.error("Disconnect handling error:", error)
      }
    })

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  })

  // Cleanup inactive connections
  setInterval(() => {
    const now = new Date()
    const timeout = 5 * 60 * 1000 // 5 minutes
    
    connectedUsers.forEach((user, socketId) => {
      if (now.getTime() - user.lastSeen.getTime() > timeout) {
        console.log(`Cleaning up inactive user: ${user.userName}`)
        connectedUsers.delete(socketId)
        broadcastRooms.get(user.broadcastId)?.delete(socketId)
      }
    })
  }, 60000) // Check every minute

  return io
}

// Database helper functions
async function updateBroadcastParticipants(broadcastId: string) {
  try {
    const { db } = await connectToDatabase()
    const roomUsers = Array.from(broadcastRooms.get(broadcastId) || [])
      .map(id => connectedUsers.get(id))
      .filter(Boolean)
    
    await db.collection("broadcasts").updateOne(
      { id: broadcastId },
      {
        $set: {
          participants: roomUsers.map(user => ({
            id: user!.id,
            name: user!.userName,
            isHost: user!.isHost,
            joinedAt: user!.joinedAt,
            userType: user!.isHost ? 'host' : 'viewer',
            isApproved: true,
            permissions: {
              canSpeak: true,
              canVideo: true,
              canScreenShare: user!.isHost,
              canChat: true,
              canReact: true
            },
            connectionStatus: 'connected',
            mediaStatus: {
              video: true,
              audio: true,
              screenShare: false
            }
          })),
          viewerCount: roomUsers.length,
          lastActivity: new Date()
        }
      }
    )
  } catch (error) {
    console.error("Update participants error:", error)
  }
}

async function saveChatMessage(message: ChatMessage) {
  try {
    const { db } = await connectToDatabase()
    await db.collection("chatMessages").insertOne(message)
    
    // Also update broadcast stats
    await db.collection("broadcasts").updateOne(
      { id: message.broadcastId },
      {
        $inc: { "stats.chatMessages": 1 },
        $set: { lastActivity: new Date() }
      }
    )
  } catch (error) {
    console.error("Save chat message error:", error)
  }
}

async function saveReaction(reaction: Reaction) {
  try {
    const { db } = await connectToDatabase()
    await db.collection("reactions").insertOne(reaction)
    
    // Also update broadcast stats
    await db.collection("broadcasts").updateOne(
      { id: reaction.broadcastId },
      {
        $inc: { "stats.reactions": 1 },
        $set: { lastActivity: new Date() }
      }
    )
  } catch (error) {
    console.error("Save reaction error:", error)
  }
}

async function endBroadcast(broadcastId: string) {
  try {
    const { db } = await connectToDatabase()
    await db.collection("broadcasts").updateOne(
      { id: broadcastId },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
          lastActivity: new Date()
        }
      }
    )
    
    // Clean up room tracking
    broadcastRooms.delete(broadcastId)
    
    console.log(`Broadcast ${broadcastId} ended`)
  } catch (error) {
    console.error("End broadcast error:", error)
  }
}