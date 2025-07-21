import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { title, hostName } = await request.json()
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
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
      })
    }

    // Get the correct base URL - prioritize environment variable for production
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${protocol}://${host}`

    const meetingId = Math.random().toString(36).substring(2, 15)
    const meetingLink = `${baseUrl}/live?meeting=${meetingId}`

    // Create new broadcast
    const broadcast = {
      id: meetingId,
      title: title || "Live Broadcast",
      isActive: true,
      startedAt: new Date(),
      meetingLink,
      participants: [
        {
          id: "host",
          name: hostName || "Governor Abba Kabir Yusuf",
          joinedAt: new Date(),
          isHost: true,
        },
      ],
      viewerCount: 0,
      createdAt: new Date(),
    }

    await db.collection("broadcasts").insertOne(broadcast)

    return NextResponse.json({
      message: "Broadcast started successfully",
      broadcast,
      meetingLink,
      meetingId,
      isExisting: false,
    })
  } catch (error) {
    console.error("Start broadcast error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
