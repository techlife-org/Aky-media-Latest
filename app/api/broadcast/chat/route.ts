import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName, message, type = "message" } = await request.json()

    if (!meetingId || !userName || !message) {
      return NextResponse.json(
        { message: "Meeting ID, user name, and message are required", success: false },
        { status: 400 }
      )
    }

    let db
    try {
      // Try primary connection first
      try {
        const dbConnection = await connectToDatabase()
        db = dbConnection.db
        console.log("[Broadcast Chat] Primary database connected")
      } catch (primaryError) {
        console.warn("[Broadcast Chat] Primary connection failed, trying fallback:", primaryError)
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
        console.log("[Broadcast Chat] Fallback database connected")
      }
    } catch (error) {
      console.error("[Broadcast Chat] All database connections failed:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false
        },
        { status: 503 }
      )
    }

    // Find the active broadcast
    const broadcast = await db.collection("broadcasts").findOne({
      $or: [
        { id: meetingId, isActive: true },
        { isActive: true } // Fallback to any active broadcast
      ]
    })

    if (!broadcast) {
      return NextResponse.json(
        { message: "No active broadcast found", success: false },
        { status: 404 }
      )
    }

    // Create chat message object
    const chatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      userId: Math.random().toString(36).substring(2, 15),
      userName: userName,
      message: message,
      timestamp: new Date(),
      type: type
    }

    // Add message to broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { id: broadcast.id },
      {
        $push: { chatMessages: chatMessage },
        $set: { 
          lastActivity: new Date(),
          heartbeat: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to send message", success: false },
        { status: 500 }
      )
    }

    console.log(`[Broadcast Chat] Message sent by ${userName} in broadcast ${broadcast.id}`)

    return NextResponse.json({
      message: "Message sent successfully",
      chatMessage,
      success: true
    })

  } catch (error) {
    console.error("[Broadcast Chat] Error:", error)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("meetingId")

    if (!meetingId) {
      return NextResponse.json(
        { message: "Meeting ID is required", success: false },
        { status: 400 }
      )
    }

    let db
    try {
      // Try primary connection first
      try {
        const dbConnection = await connectToDatabase()
        db = dbConnection.db
      } catch (primaryError) {
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
      }
    } catch (error) {
      console.error("[Broadcast Chat] Database connection failed:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false
        },
        { status: 503 }
      )
    }

    // Find the broadcast and get chat messages
    const broadcast = await db.collection("broadcasts").findOne({
      $or: [
        { id: meetingId, isActive: true },
        { isActive: true } // Fallback to any active broadcast
      ]
    })

    if (!broadcast) {
      return NextResponse.json(
        { message: "No active broadcast found", success: false },
        { status: 404 }
      )
    }

    const messages = broadcast.chatMessages || []

    return NextResponse.json({
      messages: messages.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
      success: true
    })

  } catch (error) {
    console.error("[Broadcast Chat] Error fetching messages:", error)
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