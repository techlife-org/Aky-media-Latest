import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
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

      if (!broadcast) {
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

      return NextResponse.json({
        isActive: true,
        broadcast: {
          ...broadcast,
          meetingLink,
        },
        meetingId: broadcast.id,
        participants: broadcast.participants?.length || 0,
        startTime: broadcast.startedAt,
        title: broadcast.title,
        viewerCount: broadcast.viewerCount || 0,
        meetingLink,
        status: "live",
      })
    } catch (error) {
      console.error("Database query error:", error)
      return NextResponse.json(
        {
          isActive: false,
          status: "error",
          message: "Error fetching broadcast status",
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
      },
      { status: 500 },
    )
  }
}
