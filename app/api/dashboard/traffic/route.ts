import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { withCors } from "@/lib/cors"

async function handler() {
  try {
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

    // Get all visitors
    const visitors = await db.collection("visitors").find({}).sort({ visitedAt: -1 }).toArray()
    
    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Filter today's visitors
    const todayVisitors = visitors.filter(visitor => new Date(visitor.visitedAt) >= today)
    
    // Calculate total visitors and page views
    const totalVisitors = visitors.length
    const pageViews = visitors.reduce((sum, visitor) => sum + (visitor.pages?.length || 1), 0)
    
    // Calculate bounce rate (sessions with only 1 page view)
    const singlePageVisitors = visitors.filter(visitor => !visitor.pages || visitor.pages.length <= 1).length
    const bounceRate = totalVisitors > 0 ? (singlePageVisitors / totalVisitors) * 100 : 0
    
    // Calculate top pages
    const pageMap = new Map<string, number>()
    visitors.forEach(visitor => {
      const page = visitor.page || '/'
      pageMap.set(page, (pageMap.get(page) || 0) + 1)
    })
    
    const topPages = Array.from(pageMap.entries())
      .map(([page, views]) => ({
        page,
        views,
        percentage: (views / pageViews) * 100,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
    
    // Calculate device statistics
    const deviceMap = new Map<string, number>()
    visitors.forEach(visitor => {
      const device = visitor.device || 'Desktop'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    
    const deviceStats = Array.from(deviceMap.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: (count / totalVisitors) * 100,
      }))
      .sort((a, b) => b.count - a.count)
    
    // Calculate location statistics
    const locationMap = new Map<string, {country: string, city: string, count: number}>()
    
    visitors.forEach(visitor => {
      const country = visitor.country || 'Unknown Country'
      const city = visitor.city || 'Unknown City'
      const key = `${country}:${city}`
      
      if (locationMap.has(key)) {
        const loc = locationMap.get(key)!
        loc.count += 1
      } else {
        locationMap.set(key, { country, city, count: 1 })
      }
    })
    
    const locationStats = Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Calculate hourly traffic (last 24 hours)
    const hourlyTraffic = Array(24).fill(0).map((_, hour) => {
      const hourStart = new Date()
      hourStart.setHours(hour, 0, 0, 0)
      
      const hourEnd = new Date(hourStart)
      hourEnd.setHours(hourStart.getHours() + 1)
      
      const visitorsInHour = visitors.filter(visitor => {
        const visitTime = new Date(visitor.visitedAt)
        return visitTime >= hourStart && visitTime < hourEnd
      }).length
      
      return {
        hour: hourStart.toLocaleTimeString([], { hour: '2-digit', hour12: false }),
        visitors: visitorsInHour
      }
    })
    
    // Calculate average session duration (placeholder - would need actual session data)
    const avgSessionDuration = "3:45" // This would be calculated from session data
    
    return NextResponse.json({
      totalVisitors,
      todayVisitors: todayVisitors.length,
      pageViews,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionDuration,
      topPages,
      deviceStats,
      locationStats,
      hourlyTraffic,
    })
  } catch (error) {
    console.error("Traffic API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))
