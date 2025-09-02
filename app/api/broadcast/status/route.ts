import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function GET(request: NextRequest) {
  console.log("[Broadcast Status API] Received request")
  try {
    let db
    try {
      // Use aggressive fallback for faster response
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
      console.log("[Broadcast Status API] Database connected successfully")
    } catch (error) {
      console.error("Database connection failed:", error)
      return NextResponse.json(
        {
          isActive: false,
          broadcast: null,
          meetingId: null,
          participants: 0,
          startTime: null,
          title: "",
          viewerCount: 0,
          meetingLink: null,
          status: "offline",
          message: "Service temporarily unavailable. Please try again later.",
          health: {
            server: false,
            database: false,
            streaming: false
          },
          connectionQuality: "poor"
        },
        { status: 503 },
      )
    }

    try {
      // Get active broadcast with a timeout
      const broadcast = (await Promise.race([
        db.collection("broadcasts").findOne({ isActive: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database query timeout")), 5000)),
      ])) as any

      console.log("[Broadcast Status API] Broadcast query result:", broadcast)
      
      if (!broadcast) {
        console.log("[Broadcast Status API] No active broadcast found")
        return NextResponse.json({
          isActive: false,
          broadcast: null,
          meetingId: null,
          participants: 0,
          startTime: null,
          title: "",
          viewerCount: 0,
          meetingLink: null,
          status: "idle",
          health: {
            server: true,
            database: true,
            streaming: true
          },
          connectionQuality: "excellent"
        })
      }

      // Get the correct base URL
      const host = request.headers.get("host")
      const protocol = request.headers.get("x-forwarded-proto") || "http"
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `${protocol}://${host}`
      const meetingLink = `${baseUrl}/live?meeting=${broadcast.id}`

      // Calculate uptime and simulate viewer count growth
      const uptime = broadcast.startedAt ? Math.floor((Date.now() - new Date(broadcast.startedAt).getTime()) / 1000) : 0
      const simulatedViewers = Math.max(1, Math.floor(Math.random() * 50) + Math.floor(uptime / 60))

      return NextResponse.json({
        isActive: true,
        broadcast: {
          ...broadcast,
          meetingLink,
          viewerCount: simulatedViewers,
        },
        meetingId: broadcast.id,
        participants: broadcast.participants?.length || 0,
        startTime: broadcast.startedAt,
        title: broadcast.title,
        viewerCount: simulatedViewers,
        meetingLink,
        status: "live",
        health: {
          server: true,
          database: true,
          streaming: true
        },
        connectionQuality: "excellent",
        uptime: uptime,
        stats: {
          totalViewTime: uptime * simulatedViewers,
          peakViewers: Math.max(simulatedViewers, Math.floor(simulatedViewers * 1.5)),
          averageViewTime: Math.floor(uptime * 0.7),
          chatMessages: Math.floor(uptime / 30)
        }
      })
    } catch (error) {
      console.error("Database query error:", error)
      return NextResponse.json(
        {
          isActive: false,
          status: "error",
          message: "Error fetching broadcast status",
          health: {
            server: true,
            database: false,
            streaming: false
          },
          connectionQuality: "poor"
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Broadcast status error:", error)
    return NextResponse.json(
      {
        isActive: false,
        status: "error",
        message: "Internal server error",
        health: {
          server: false,
          database: false,
          streaming: false
        },
        connectionQuality: "poor"
      },
      { status: 500 },
    )
  }
}