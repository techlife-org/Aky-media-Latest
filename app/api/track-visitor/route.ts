import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get visitor information
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const { page, referrer } = await request.json()

    // Create visitor record
    const visitor = {
      ip: ip.split(",")[0].trim(),
      userAgent,
      page,
      referrer,
      visitedAt: new Date(),
      country: "Nigeria", // Would use IP geolocation service
      city: "Kano",
      device: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
      browser: getBrowserFromUserAgent(userAgent),
    }

    await db.collection("visitors").insertOne(visitor)

    // Track page view
    await db.collection("pageviews").insertOne({
      page,
      ip: visitor.ip,
      visitedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Visitor tracking error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function getBrowserFromUserAgent(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"
  return "Unknown"
}
