import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get active broadcast
    const broadcast = await db.collection("broadcasts").findOne({ isActive: true })

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
    })
  } catch (error) {
    console.error("Broadcast status error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
