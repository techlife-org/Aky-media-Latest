import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName, message, type = "message" } = await request.json()
    const { db } = await connectToDatabase()

    // Find active broadcast
    const broadcast = await db.collection("broadcasts").findOne({
      $or: [{ id: meetingId }, { isActive: true }],
      isActive: true,
    })

    if (!broadcast) {
      return NextResponse.json({ message: "No active broadcast found" }, { status: 404 })
    }

    // Create chat message
    const chatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      broadcastId: broadcast.id,
      userName,
      message,
      type, // 'message', 'reaction', 'join', 'leave'
      timestamp: new Date(),
      createdAt: new Date(),
    }

    // Save chat message
    await db.collection("chat_messages").insertOne(chatMessage)

    // Update broadcast activity
    await db.collection("broadcasts").updateOne(
      { _id: broadcast._id },
      {
        $set: { lastActivity: new Date() },
        $inc: { messageCount: 1 },
      },
    )

    return NextResponse.json({
      message: "Message sent successfully",
      chatMessage,
    })
  } catch (error) {
    console.error("Chat message error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("meetingId")
    const { db } = await connectToDatabase()

    // Find active broadcast
    const broadcast = await db.collection("broadcasts").findOne({
      $or: [{ id: meetingId }, { isActive: true }],
      isActive: true,
    })

    if (!broadcast) {
      return NextResponse.json({ messages: [] })
    }

    // Get recent chat messages
    const messages = await db
      .collection("chat_messages")
      .find({ broadcastId: broadcast.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      messages: messages.reverse(), // Show oldest first
    })
  } catch (error) {
    console.error("Get chat messages error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}
