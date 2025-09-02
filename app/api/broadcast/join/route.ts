import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    const { meetingId, userName, userType = "viewer" } = await request.json()

    if (!userName || !userName.trim()) {
      return NextResponse.json(
        { message: "Name is required to join the broadcast", success: false },
        { status: 400 }
      )
    }

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

    // Find active broadcast
    const broadcast = await db.collection("broadcasts").findOne({
      isActive: true,
      ...(meetingId && meetingId !== "default" ? { id: meetingId } : {})
    })

    if (!broadcast) {
      return NextResponse.json(
        { 
          message: "No active broadcast found to join",
          success: false
        },
        { status: 404 }
      )
    }

    // Create participant object
    const participantId = Math.random().toString(36).substring(2, 15)
    const participant = {
      id: participantId,
      name: userName.trim(),
      email: "",
      isHost: false,
      isApproved: true,
      joinedAt: new Date(),
      userType: userType,
      permissions: {
        canSpeak: false,
        canVideo: false,
        canScreenShare: false,
        canChat: true,
        canReact: true
      },
      connectionStatus: 'connected',
      mediaStatus: {
        video: false,
        audio: false,
        screenShare: false
      }
    }

    // Add participant to broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { _id: broadcast._id },
      {
        $push: {
          participants: participant
        },
        $set: {
          lastActivity: new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { 
          message: "Failed to join broadcast",
          success: false
        },
        { status: 500 }
      )
    }

    // Get updated broadcast info
    const updatedBroadcast = await db.collection("broadcasts").findOne({ _id: broadcast._id })

    return NextResponse.json({
      message: "Successfully joined the broadcast",
      success: true,
      participant: {
        id: participantId,
        name: userName.trim(),
        userType: userType,
        joinedAt: new Date()
      },
      broadcast: {
        id: updatedBroadcast?.id,
        title: updatedBroadcast?.title,
        participantCount: updatedBroadcast?.participants?.length || 0,
        meetingLink: updatedBroadcast?.meetingLink
      },
      health: {
        server: true,
        database: true,
        streaming: true
      }
    })

  } catch (error) {
    console.error("Join broadcast error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        health: {
          server: false,
          database: false,
          streaming: false
        }
      },
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))