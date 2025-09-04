import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName, userType = "viewer" } = await request.json()

    if (!meetingId || !userName) {
      return NextResponse.json(
        { message: "Meeting ID and user name are required", success: false },
        { status: 400 }
      )
    }

    let db
    try {
      // Try primary connection first
      try {
        const dbConnection = await connectToDatabase()
        db = dbConnection.db
        console.log("[Broadcast Join] Primary database connected")
      } catch (primaryError) {
        console.warn("[Broadcast Join] Primary connection failed, trying fallback:", primaryError)
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
        console.log("[Broadcast Join] Fallback database connected")
      }
    } catch (error) {
      console.error("[Broadcast Join] All database connections failed:", error)
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

    // Create participant object
    const participantId = Math.random().toString(36).substring(2, 15)
    const participant = {
      id: participantId,
      name: userName,
      joinedAt: new Date(),
      isHost: false,
      userType: userType,
      isActive: true
    }

    // Check if user already joined (by name)
    const existingParticipant = broadcast.participants?.find(
      (p: any) => p.name === userName && p.isActive
    )

    if (existingParticipant) {
      return NextResponse.json({
        message: "User already joined",
        participant: existingParticipant,
        broadcast: {
          id: broadcast.id,
          title: broadcast.title,
          startedAt: broadcast.startedAt
        },
        success: true
      })
    }

    // Add participant to broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { id: broadcast.id },
      {
        $push: { participants: participant },
        $inc: { 
          viewerCount: 1,
          totalViewers: 1,
          currentViewers: 1
        },
        $max: { peakViewers: (broadcast.participants?.length || 0) + 1 },
        $set: { 
          lastActivity: new Date(),
          heartbeat: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to join broadcast", success: false },
        { status: 500 }
      )
    }

    // Add join message to chat
    const joinMessage = {
      id: Math.random().toString(36).substring(2, 15),
      userId: participantId,
      userName: "System",
      message: `${userName} joined the broadcast`,
      timestamp: new Date(),
      type: "join"
    }

    await db.collection("broadcasts").updateOne(
      { id: broadcast.id },
      {
        $push: { chatMessages: joinMessage }
      }
    )

    console.log(`[Broadcast Join] User ${userName} joined broadcast ${broadcast.id}`)

    return NextResponse.json({
      message: "Successfully joined broadcast",
      participant,
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        startedAt: broadcast.startedAt,
        participants: [...(broadcast.participants || []), participant]
      },
      success: true
    })

  } catch (error) {
    console.error("[Broadcast Join] Error:", error)
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

export async function DELETE(request: NextRequest) {
  try {
    const { meetingId, participantId, userName } = await request.json()

    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
    }

    // Remove participant from broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { 
        $or: [
          { id: meetingId },
          { isActive: true }
        ]
      },
      {
        $pull: { 
          participants: { 
            $or: [
              { id: participantId },
              { name: userName }
            ]
          }
        },
        $inc: { 
          viewerCount: -1,
          currentViewers: -1
        },
        $set: { 
          lastActivity: new Date(),
          heartbeat: new Date()
        }
      }
    )

    if (updateResult.modifiedCount > 0) {
      // Add leave message to chat
      const leaveMessage = {
        id: Math.random().toString(36).substring(2, 15),
        userId: "system",
        userName: "System",
        message: `${userName || "A user"} left the broadcast`,
        timestamp: new Date(),
        type: "leave"
      }

      await db.collection("broadcasts").updateOne(
        { 
          $or: [
            { id: meetingId },
            { isActive: true }
          ]
        },
        {
          $push: { chatMessages: leaveMessage }
        }
      )
    }

    return NextResponse.json({
      message: "Successfully left broadcast",
      success: true
    })

  } catch (error) {
    console.error("[Broadcast Leave] Error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false
      },
      { status: 500 }
    )
  }
}