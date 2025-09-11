import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { ChatMessage, Reaction } from "@/models/BroadcastAdmin"

// GET - Retrieve chat messages for a broadcast
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const broadcastId = searchParams.get("broadcastId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!broadcastId) {
      return NextResponse.json(
        { message: "Broadcast ID is required", success: false },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get chat messages
    const messages = await db
      .collection("chatMessages")
      .find({ broadcastId, isDeleted: false })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    // Get reactions
    const reactions = await db
      .collection("reactions")
      .find({ broadcastId })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Reverse to get chronological order
      reactions,
      total: await db.collection("chatMessages").countDocuments({ broadcastId, isDeleted: false })
    })
  } catch (error) {
    console.error("Get chat messages error:", error)
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    )
  }
}

// POST - Send a chat message or reaction
export async function POST(request: NextRequest) {
  try {
    const { broadcastId, participantId, participantName, message, type, emoji } = await request.json()

    if (!broadcastId || !participantId || !participantName) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verify broadcast exists and is active
    const broadcast = await db.collection("broadcasts").findOne({
      id: broadcastId,
      isActive: true
    })

    if (!broadcast) {
      return NextResponse.json(
        { message: "Broadcast not found or inactive", success: false },
        { status: 404 }
      )
    }

    if (type === "reaction" && emoji) {
      // Handle reaction
      const reaction: Reaction = {
        id: Math.random().toString(36).substring(2, 15),
        broadcastId,
        participantId,
        participantName,
        emoji,
        timestamp: new Date()
      }

      await db.collection("reactions").insertOne(reaction)
      
      // Update broadcast stats
      await db.collection("broadcasts").updateOne(
        { id: broadcastId },
        {
          $inc: { "stats.reactions": 1 },
          $set: { updatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        reaction,
        message: "Reaction sent successfully"
      })
    } else if (message) {
      // Handle chat message
      const chatMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        broadcastId,
        participantId,
        participantName,
        message: message.trim(),
        type: type || 'message',
        timestamp: new Date(),
        isDeleted: false
      }

      await db.collection("chatMessages").insertOne(chatMessage)
      
      // Update broadcast stats
      await db.collection("broadcasts").updateOne(
        { id: broadcastId },
        {
          $inc: { "stats.chatMessages": 1 },
          $set: { updatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        chatMessage,
        message: "Message sent successfully"
      })
    } else {
      return NextResponse.json(
        { message: "Either message or emoji is required", success: false },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Send chat message/reaction error:", error)
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    )
  }
}

// DELETE - Delete a chat message (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    const broadcastId = searchParams.get("broadcastId")

    if (!messageId || !broadcastId) {
      return NextResponse.json(
        { message: "Message ID and Broadcast ID are required", success: false },
        { status: 400 }
      )
    }

    // TODO: Add admin authentication check here
    // For now, we'll soft delete the message

    const { db } = await connectToDatabase()

    const result = await db.collection("chatMessages").updateOne(
      { id: messageId, broadcastId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Message not found", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully"
    })
  } catch (error) {
    console.error("Delete chat message error:", error)
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    )
  }
}