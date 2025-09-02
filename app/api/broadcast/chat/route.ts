import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  const method = request.method

  let db
  try {
    // Use aggressive fallback for faster response
    const fallbackConnection = await connectToDatabaseWithFallback()
    db = fallbackConnection.db
  } catch (error) {
    console.error("Database connection failed:", error)
    return NextResponse.json(
      {
        message: "Service temporarily unavailable. Please try again later.",
        success: false,
        health: {
          server: false,
          database: false,
          streaming: false
        }
      },
      { status: 503 }
    )
  }

  if (method === "GET") {
    // Get chat history
    try {
      const { searchParams } = new URL(request.url)
      const meetingId = searchParams.get("meetingId")

      const broadcast = await db.collection("broadcasts").findOne({
        isActive: true,
        ...(meetingId && meetingId !== "default" ? { id: meetingId } : {})
      })

      if (!broadcast) {
        return NextResponse.json({
          messages: [],
          success: true
        })
      }

      const messages = broadcast.chatMessages || []

      return NextResponse.json({
        messages: messages.map((msg: any) => ({
          id: msg.id,
          userName: msg.userName,
          message: msg.message,
          timestamp: msg.timestamp,
          type: msg.type || "message"
        })),
        success: true,
        health: {
          server: true,
          database: true,
          streaming: true
        }
      })

    } catch (error) {
      console.error("Get chat history error:", error)
      return NextResponse.json(
        { 
          message: "Failed to load chat history",
          messages: [],
          success: false
        },
        { status: 500 }
      )
    }
  }

  if (method === "POST") {
    // Send chat message or reaction
    try {
      const { meetingId, userName, message, type = "message" } = await request.json()

      if (!userName || !message) {
        return NextResponse.json(
          { message: "Username and message are required", success: false },
          { status: 400 }
        )
      }

      const broadcast = await db.collection("broadcasts").findOne({
        isActive: true,
        ...(meetingId && meetingId !== "default" ? { id: meetingId } : {})
      })

      if (!broadcast) {
        return NextResponse.json(
          { 
            message: "No active broadcast found",
            success: false
          },
          { status: 404 }
        )
      }

      // Create chat message
      const chatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        userName: userName.trim(),
        message: message.trim(),
        timestamp: new Date(),
        type: type
      }

      // Add message to broadcast
      const updateResult = await db.collection("broadcasts").updateOne(
        { _id: broadcast._id },
        {
          $push: {
            chatMessages: chatMessage
          },
          $set: {
            lastActivity: new Date(),
            updatedAt: new Date()
          },
          $inc: {
            "stats.chatMessages": 1
          }
        }
      )

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { 
            message: "Failed to send message",
            success: false
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: "Message sent successfully",
        success: true,
        chatMessage: {
          id: chatMessage.id,
          userName: chatMessage.userName,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp,
          type: chatMessage.type
        },
        health: {
          server: true,
          database: true,
          streaming: true
        }
      })

    } catch (error) {
      console.error("Send chat message error:", error)
      return NextResponse.json(
        { 
          message: "Internal server error",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { message: "Method not allowed", success: false },
    { status: 405 }
  )
}

export const GET = withCors(handler)
export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))