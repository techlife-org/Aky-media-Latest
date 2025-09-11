import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function GET(request: NextRequest) {
  console.log("[Broadcast Status API] Received request")
  try {
    let db
    try {
      // Try primary connection first, then fallback
      try {
        const primaryConnection = await connectToDatabase()
        db = primaryConnection.db
        console.log("[Broadcast Status API] Primary database connected successfully")
      } catch (primaryError) {
        console.warn("[Broadcast Status API] Primary connection failed, trying fallback:", primaryError)
        const fallbackConnection = await connectToDatabaseWithFallback()
        db = fallbackConnection.db
        console.log("[Broadcast Status API] Fallback database connected successfully")
      }
    } catch (error) {
      console.error("[Broadcast Status API] All database connections failed:", error)
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
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database query timeout")), 10000)),
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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`)
      const meetingLink = `${baseUrl}/live/${broadcast.id}`

      // Calculate uptime and get REAL participant count (no more random numbers!)
      const uptime = broadcast.startedAt ? Math.floor((Date.now() - new Date(broadcast.startedAt).getTime()) / 1000) : 0
      const realViewerCount = broadcast.participants?.length || 0
      const totalViewers = broadcast.totalViewers || realViewerCount
      const peakViewers = broadcast.peakViewers || realViewerCount
      const chatMessageCount = broadcast.chatMessages?.length || 0

      // Update broadcast with current stats
      await db.collection("broadcasts").updateOne(
        { id: broadcast.id },
        {
          $set: {
            lastActivity: new Date(),
            uptime: uptime,
            currentViewers: realViewerCount
          },
          $max: {
            peakViewers: realViewerCount
          }
        }
      )

      return NextResponse.json({
        isActive: true,
        broadcast: {
          ...broadcast,
          meetingLink,
          viewerCount: realViewerCount,
          uptime: uptime,
          lastActivity: new Date()
        },
        meetingId: broadcast.id,
        participants: realViewerCount,
        startTime: broadcast.startedAt,
        title: broadcast.title,
        viewerCount: realViewerCount, // Real count, not random!
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
          totalViewTime: uptime * realViewerCount,
          peakViewers: Math.max(peakViewers, realViewerCount),
          averageViewTime: uptime > 0 ? Math.floor(uptime * 0.7) : 0,
          chatMessages: chatMessageCount,
          currentViewers: realViewerCount,
          totalViewers: totalViewers
        }
      })
    } catch (error) {
      console.error("[Broadcast Status API] Database query error:", error)
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
    console.error("[Broadcast Status API] Broadcast status error:", error)
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