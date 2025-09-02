import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import type { BroadcastSession } from "@/models/BroadcastAdmin"

export async function POST(request: NextRequest) {
  try {
    // Verify broadcast admin authentication
    const token = request.cookies.get("broadcast-auth-token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required", success: false },
        { status: 401 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error", success: false },
        { status: 500 }
      )
    }

    let adminData
    try {
      adminData = jwt.verify(token, jwtSecret) as any
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid authentication token", success: false },
        { status: 401 }
      )
    }

    const { title, description, settings } = await request.json()
    
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
        { status: 503 },
      )
    }

    // Check if admin already has an active broadcast
    const existingBroadcast = await db.collection("broadcasts").findOne({ 
      adminId: adminData.id,
      isActive: true 
    })

    if (existingBroadcast) {
      // Return the existing broadcast
      const host = request.headers.get("host")
      const protocol = request.headers.get("x-forwarded-proto") || "http"
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `${protocol}://${host}`
      const meetingLink = `${baseUrl}/live?meeting=${existingBroadcast.id}`

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

    // Get the correct base URL
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${protocol}://${host}`

    const meetingId = Math.random().toString(36).substring(2, 15)
    const meetingLink = `${baseUrl}/live?meeting=${meetingId}`

    // Create new enhanced broadcast session
    const broadcast: BroadcastSession = {
      id: meetingId,
      adminId: adminData.id,
      title: title || "Governor's Live Address",
      description: description || "",
      isActive: true,
      isRecording: false,
      startedAt: new Date(),
      meetingLink,
      participants: [
        {
          id: "host-" + adminData.id,
          name: adminData.name || "Governor Abba Kabir Yusuf",
          email: adminData.email,
          isHost: true,
          isApproved: true,
          joinedAt: new Date(),
          userType: 'host',
          permissions: {
            canSpeak: true,
            canVideo: true,
            canScreenShare: true,
            canChat: true,
            canReact: true
          },
          connectionStatus: 'connected',
          mediaStatus: {
            video: true,
            audio: true,
            screenShare: false
          }
        },
      ],
      settings: {
        maxParticipants: settings?.maxParticipants || 1000,
        allowScreenShare: settings?.allowScreenShare ?? true,
        allowChat: settings?.allowChat ?? true,
        allowReactions: settings?.allowReactions ?? true,
        requireApproval: settings?.requireApproval ?? false,
        isPublic: settings?.isPublic ?? true
      },
      stats: {
        totalViewTime: 0,
        peakViewers: 0,
        averageViewTime: 0,
        chatMessages: 0,
        reactions: 0,
        totalParticipants: 1
      },
      chatMessages: [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection("broadcasts").insertOne(broadcast)

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
    console.error("Start broadcast error:", error)
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