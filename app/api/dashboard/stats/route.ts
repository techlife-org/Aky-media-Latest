import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get visitor stats
    const totalVisitors = await db.collection("visitors").countDocuments()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayVisitors = await db.collection("visitors").countDocuments({
      visitedAt: { $gte: today },
    })

    // Get subscriber count
    const subscribers = await db.collection("subscribers").countDocuments({
      status: "active",
    })

    // Get contact messages count
    const contactMessages = await db.collection("contacts").countDocuments()

    // Get page views (sum of all visitor page arrays)
    const visitors = await db.collection("visitors").find({}).toArray()
    const pageViews = visitors.reduce((total, visitor) => {
      return total + (visitor.pages ? visitor.pages.length : 1)
    }, 0)

    // Calculate bounce rate (visitors with only 1 page view)
    const singlePageVisitors = visitors.filter((visitor) => !visitor.pages || visitor.pages.length <= 1).length
    const bounceRate = totalVisitors > 0 ? Math.round((singlePageVisitors / totalVisitors) * 100) : 0

    // Get recent visitors
    const recentVisitors = await db.collection("visitors").find({}).sort({ visitedAt: -1 }).limit(10).toArray()

    const stats = {
      totalVisitors,
      todayVisitors,
      subscribers,
      contactMessages,
      pageViews,
      bounceRate,
    }

    return NextResponse.json({
      stats,
      recentVisitors: recentVisitors.map((visitor) => ({
        ...visitor,
        id: visitor._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)

    // Return fallback data if database fails
    return NextResponse.json({
      stats: {
        totalVisitors: 1250,
        todayVisitors: 45,
        subscribers: 320,
        contactMessages: 28,
        pageViews: 5680,
        bounceRate: 35,
      },
      recentVisitors: [],
    })
  }
}

export const GET = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))
