import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id
    const { type, data } = await request.json()

    // Connect to database
    let db
    try {
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
    } catch (error) {
      console.error("Database connection failed:", error)
      return NextResponse.json(
        { 
          message: "Service temporarily unavailable", 
          success: false,
          error: "database_connection_failed"
        },
        { status: 503 }
      )
    }

    // Check if broadcast exists and is active
    const broadcast = await db.collection("broadcasts").findOne({
      $or: [
        { id: broadcastId, isActive: true },
        { _id: broadcastId, isActive: true }
      ]
    })

    if (!broadcast) {
      return NextResponse.json(
        { 
          message: "Broadcast not found or inactive", 
          success: false,
          error: "broadcast_not_found"
        },
        { status: 404 }
      )
    }

    // Handle different signaling message types
    switch (type) {
      case 'offer':
        // Store offer in database for this broadcast
        await db.collection("broadcast_signaling").insertOne({
          broadcastId,
          type: 'offer',
          data,
          timestamp: new Date()
        })
        
        // Return success
        return NextResponse.json({
          success: true,
          broadcastId,
          message: "Offer received and stored"
        })

      case 'answer':
        // Store answer in database for this broadcast
        await db.collection("broadcast_signaling").insertOne({
          broadcastId,
          type: 'answer',
          data,
          timestamp: new Date()
        })
        
        // Return success
        return NextResponse.json({
          success: true,
          broadcastId,
          message: "Answer received and stored"
        })

      case 'candidate':
        // Store ICE candidate in database for this broadcast
        await db.collection("broadcast_signaling").insertOne({
          broadcastId,
          type: 'candidate',
          data,
          timestamp: new Date()
        })
        
        // Return success
        return NextResponse.json({
          success: true,
          broadcastId,
          message: "ICE candidate received and stored"
        })

      default:
        return NextResponse.json(
          { 
            message: "Unsupported signaling message type", 
            success: false,
            error: "unsupported_type"
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("WebRTC signaling error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false,
        error: "internal_server_error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for polling signaling messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id
    
    // Connect to database
    let db
    try {
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
    } catch (error) {
      console.error("Database connection failed:", error)
      return NextResponse.json(
        { 
          message: "Service temporarily unavailable", 
          success: false,
          error: "database_connection_failed"
        },
        { status: 503 }
      )
    }

    // Get recent signaling messages for this broadcast
    const messages = await db.collection("broadcast_signaling")
      .find({ broadcastId })
      .sort({ timestamp: 1 })
      .limit(10)
      .toArray()

    // Remove the messages we're returning to avoid duplicates
    if (messages.length > 0) {
      const messageIds = messages.map(msg => msg._id)
      await db.collection("broadcast_signaling")
        .deleteMany({ _id: { $in: messageIds } })
    }

    return NextResponse.json({
      success: true,
      broadcastId,
      messages
    })

  } catch (error) {
    console.error("WebRTC signaling poll error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false,
        error: "internal_server_error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}