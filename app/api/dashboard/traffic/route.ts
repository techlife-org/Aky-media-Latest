import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      // Return a default response when database is not available
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    // Get traffic data from visitors collection
    const visitors = await db.collection("visitors").find({}).toArray()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayVisitors = visitors.filter((visitor) => new Date(visitor.visitedAt) >= today)

    // Calculate stats
    const totalVisitors = visitors.length
    const pageViews = visitors.reduce((sum, visitor) => sum + (visitor.pages?.length || 1), 0)
    const bounceRate = (visitors.filter((visitor) => visitor.pages?.length === 1).length / totalVisitors) * 100

    // Top pages
    const pageMap = new Map<string, number>()
    visitors.forEach((visitor) => {
      // Assuming 'page' is the current page visited, and 'pages' is an array of pages in a session
      // If 'pageviews' collection is used, it would be more accurate to sum from there.
      // For now, let's count the 'page' field from each visitor entry.
      if (visitor.page) {
        pageMap.set(visitor.page, (pageMap.get(visitor.page) || 0) + 1)
      }
    })
    const topPages = Array.from(pageMap.entries())
      .map(([page, views]) => ({
        page,
        views,
        percentage: (views / pageViews) * 100,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Device stats
    const deviceMap = new Map<string, number>()
    visitors.forEach((visitor) => {
      const device = visitor.device || "Desktop"
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const deviceStats = Array.from(deviceMap.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: (count / totalVisitors) * 100,
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    // Location stats
    const locationMap = new Map<string, number>()
    visitors.forEach((visitor) => {
      const key = `${visitor.city || "Unknown City"}, ${visitor.country || "Unknown Country"}`
      locationMap.set(key, (locationMap.get(key) || 0) + 1)
    })
    const locationStats = Array.from(locationMap.entries())
      .map(([location, count]) => {
        const [city, country] = location.split(", ")
        return { country, city, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      totalVisitors,
      todayVisitors: todayVisitors.length,
      pageViews,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionDuration: "3:45", // Placeholder, requires more complex tracking
      topPages,
      deviceStats,
      locationStats,
      hourlyTraffic: [
        // Placeholder data, would be aggregated from timestamps
        { hour: "00:00", visitors: 45 },
        { hour: "06:00", visitors: 120 },
        { hour: "12:00", visitors: 280 },
        { hour: "18:00", visitors: 350 },
      ],
    })
  } catch (error) {
    console.error("Traffic API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
