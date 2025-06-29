import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName, userType } = await request.json()
    const { db } = await connectToDatabase()

    // Find active broadcast - check by meetingId if provided, otherwise get any active broadcast
    let broadcast
    if (meetingId && meetingId !== "default") {
      broadcast = await db.collection("broadcasts").findOne({
        id: meetingId,
        isActive: true,
      })
    } else {
      // Get any active broadcast
      broadcast = await db.collection("broadcasts").findOne({
        isActive: true,
      })
    }

    if (!broadcast) {
      return NextResponse.json({ message: "No active broadcast found" }, { status: 404 })
    }

    // Add participant as viewer
    const newParticipant = {
      id: Math.random().toString(36).substring(2, 15),
      name: userName,
      joinedAt: new Date(),
      isHost: false,
      userType: userType || "viewer",
    }

    // Update broadcast with new participant
    await db.collection("broadcasts").updateOne(
      { _id: broadcast._id },
      {
        $push: { participants: newParticipant },
        $inc: { viewerCount: 1 },
        $set: { lastActivity: new Date() },
      },
    )

    return NextResponse.json({
      message: "Joined broadcast successfully",
      participant: newParticipant,
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        startedAt: broadcast.startedAt,
        viewerCount: (broadcast.viewerCount || 0) + 1,
      },
    })
  } catch (error) {
    console.error("Join broadcast error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
