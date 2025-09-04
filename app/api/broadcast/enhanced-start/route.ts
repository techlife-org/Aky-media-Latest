import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function POST(request: NextRequest) {
  try {
    const { title, description, settings } = await request.json()
    let db
    try {
      // Try primary connection first
      try {
        const dbConnection = await connectToDatabase()
        db = dbConnection.db
        console.log("[Enhanced Broadcast Start] Primary database connected")
      } catch (primaryError) {
        console.warn("[Enhanced Broadcast Start] Primary connection failed, trying fallback:", primaryError)
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
        console.log("[Enhanced Broadcast Start] Fallback database connected")
      }
    } catch (error) {
      console.error("[Enhanced Broadcast Start] All database connections failed:", error)
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

    // Create new enhanced broadcast with proper structure
    const broadcast = {
      id: meetingId,
      title: title || "Live Broadcast",
      description: description || "",
      isActive: true,
      startedAt: new Date(),
      lastActivity: new Date(),
      meetingLink,
      participants: [
        {
          id: "host",
          name: "Governor Abba Kabir Yusuf",
          joinedAt: new Date(),
          isHost: true,
          userType: "host",
          isActive: true
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
        chatMessages: 0,
        currentViewers: 1,
        totalViewers: 1
      },
      // Add heartbeat mechanism
      heartbeat: new Date(),
      // Enhanced broadcast settings
      settings: {
        allowChat: settings?.allowChat ?? true,
        allowReactions: settings?.allowReactions ?? true,
        allowScreenShare: settings?.allowScreenShare ?? true,
        maxParticipants: settings?.maxParticipants || 1000,
        requireApproval: settings?.requireApproval ?? false,
        isPublic: settings?.isPublic ?? true,
        autoRecord: settings?.autoRecord ?? false,
        allowAnonymous: settings?.allowAnonymous ?? true
      },
      // Enhanced features
      features: {
        chat: true,
        reactions: true,
        screenShare: true,
        recording: false,
        analytics: true
      },
      // Quality settings
      quality: {
        video: "HD",
        audio: "High",
        bitrate: "auto"
      }
    }

    await db.collection("broadcasts").insertOne(broadcast)

    console.log(`[Enhanced Broadcast Start] New enhanced broadcast created: ${meetingId}`)

    return NextResponse.json({
      message: "Enhanced broadcast started successfully",
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
      },
      features: broadcast.features,
      settings: broadcast.settings
    })
  } catch (error) {
    console.error("[Enhanced Broadcast Start] Error:", error)
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