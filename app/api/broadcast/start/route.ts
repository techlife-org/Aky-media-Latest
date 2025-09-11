import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(request: NextRequest) {
  try {
    const { title, hostName } = await request.json()
    let db
    try {
      // Try primary connection first
      try {
        const dbConnection = await connectToDatabase()
        db = dbConnection.db
        console.log("[Broadcast Start] Primary database connected")
      } catch (primaryError) {
        console.warn("[Broadcast Start] Primary connection failed, trying fallback:", primaryError)
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
        console.log("[Broadcast Start] Fallback database connected")
      }
    } catch (error) {
      console.error("[Broadcast Start] All database connections failed:", error)
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
        { status: 503 },
      )
    }

    // Check if there's already an active broadcast
    const existingBroadcast = await db.collection("broadcasts").findOne({ isActive: true })

    if (existingBroadcast) {
      // Instead of returning error, return the existing broadcast
      const host = request.headers.get("host")
      const protocol = request.headers.get("x-forwarded-proto") || "http"
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`)
      const meetingLink = `${baseUrl}/live/${existingBroadcast.id}`

      return NextResponse.json({
        message: "Broadcast already active",
        broadcast: existingBroadcast,
        meetingLink,
        isExisting: true,
        success: true,
        timestamp: new Date().toISOString(),
        health: {
          server: true,
          database: true,
          streaming: true
        }
      })
    }

    // Get the correct base URL - prioritize environment variable for production
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`)

    const meetingId = Math.random().toString(36).substring(2, 15)
    const meetingLink = `${baseUrl}/live/${meetingId}`

    // Create new broadcast with proper structure
    const broadcast = {
      id: meetingId,
      title: title || "Live Broadcast",
      isActive: true,
      startedAt: new Date(),
      lastActivity: new Date(),
      meetingLink,
      participants: [
        {
          id: "host",
          name: hostName || "Governor Abba Kabir Yusuf",
          joinedAt: new Date(),
          isHost: true,
        },
      ],
      viewerCount: 1, // Start with host
      totalViewers: 1,
      peakViewers: 1,
      currentViewers: 1,
      createdAt: new Date(),
      chatMessages: [],
      stats: {
        totalViewTime: 0,
        peakViewers: 1,
        averageViewTime: 0,
        chatMessages: 0
      },
      // Add heartbeat mechanism
      heartbeat: new Date(),
      // Broadcast settings
      settings: {
        allowChat: true,
        allowReactions: true,
        allowScreenShare: true,
        maxParticipants: 1000,
        isPublic: true
      }
    }

    await db.collection("broadcasts").insertOne(broadcast)

    console.log(`[Broadcast Start] New broadcast created: ${meetingId}`)

    return NextResponse.json({
      message: "Broadcast started successfully",
      broadcast,
      meetingLink,
      meetingId,
      isExisting: false,
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        server: true,
        database: true,
        streaming: true
      }
    })
  } catch (error) {
    console.error("[Broadcast Start] Error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      health: {
        server: false,
        database: false,
        streaming: false
      }
    }, { status: 500 })
  }
}