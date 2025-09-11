import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

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
      console.error("[Broadcast Heartbeat] Database connection failed:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable",
          success: false
        },
        { status: 503 }
      )
    }

    // Update heartbeat for the broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { 
        $or: [
          { id: meetingId, isActive: true },
          { isActive: true } // Fallback to any active broadcast
        ]
      },
      {
        $set: { 
          heartbeat: new Date(),
          lastActivity: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No active broadcast found", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Heartbeat updated",
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("[Broadcast Heartbeat] Error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false
      },
      { status: 500 }
    )
  }
}

// Cleanup stale broadcasts (older than 2 hours without heartbeat)
export async function DELETE(request: NextRequest) {
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
    }

    // Find broadcasts that haven't had a heartbeat in 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    const staleResult = await db.collection("broadcasts").updateMany(
      {
        isActive: true,
        $or: [
          { heartbeat: { $lt: twoHoursAgo } },
          { heartbeat: { $exists: false } },
          { lastActivity: { $lt: twoHoursAgo } }
        ]
      },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
          endReason: "Automatic cleanup - no heartbeat"
        }
      }
    )

    return NextResponse.json({
      message: `Cleaned up ${staleResult.modifiedCount} stale broadcasts`,
      cleanedCount: staleResult.modifiedCount,
      success: true
    })

  } catch (error) {
    console.error("[Broadcast Cleanup] Error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false
      },
      { status: 500 }
    )
  }
}