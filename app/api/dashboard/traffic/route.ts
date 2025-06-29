import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

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
    const pageMap = new Map()
    visitors.forEach((visitor) => {
      visitor.pages?.forEach((page: string) => {
        pageMap.set(page, (pageMap.get(page) || 0) + 1)
      })
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
    const deviceMap = new Map()
    visitors.forEach((visitor) => {
      const device = visitor.device || "Desktop"
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })

    const deviceStats = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
      percentage: (count / totalVisitors) * 100,
    }))

    // Location stats
    const locationMap = new Map()
    visitors.forEach((visitor) => {
      const key = `${visitor.city}, ${visitor.country}`
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
      avgSessionDuration: "3:45",
      topPages,
      deviceStats,
      locationStats,
      hourlyTraffic: [
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
