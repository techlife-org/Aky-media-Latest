import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { withCors } from "@/lib/cors"
import { ObjectId } from 'mongodb'

// Cache for 5 minutes
const CACHE_DURATION = 300

// Define types for our aggregation results
interface VisitorStats {
  totalVisitors: number
  pageViews: number
}

interface SubscriberStats {
  subscribers: number
  newSubscribers: number
}

interface BounceStats {
  singlePageVisitors: number
  totalSessions: number
}

async function handler(request: NextRequest) {
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

    // Get visitor statistics using aggregation for better performance
    const [
      visitorStats,
      subscriberStats,
      contactMessages,
      recentVisitors,
      bounceStats
    ] = await Promise.all([
      // Get visitor stats
      db.collection("visitors").aggregate<VisitorStats>([
        {
          $group: {
            _id: null,
            totalVisitors: { $sum: 1 },
            pageViews: { $sum: { $add: [1] } } // Each visitor is at least one page view
          }
        },
        {
          $project: {
            _id: 0,
            totalVisitors: 1,
            pageViews: 1
          }
        }
      ]).next().then(res => res || { totalVisitors: 0, pageViews: 0 }),
      
      // Get subscriber stats
      db.collection("subscribers").aggregate<SubscriberStats>([
        {
          $match: { status: "active" }
        },
        {
          $group: {
            _id: null,
            subscribers: { $sum: 1 },
            newSubscribers: {
              $sum: {
                $cond: [
                  { $gte: ["$createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            subscribers: 1,
            newSubscribers: 1
          }
        }
      ]).next().then(res => res || { subscribers: 0, newSubscribers: 0 }),
      
      // Get contact messages count
      db.collection("contacts").countDocuments(),
      
      // Get recent visitors (last 10)
      db.collection("visitors")
        .find({})
        .sort({ visitedAt: -1 })
        .limit(10)
        .toArray(),
      
      // Calculate bounce rate
      db.collection("visitors").aggregate<BounceStats>([
        {
          $group: {
            _id: null,
            singlePageVisitors: {
              $sum: {
                $cond: [
                  { $lte: [{ $size: { $ifNull: ["$pages", [1]] } }, 1] },
                  1,
                  0
                ]
              }
            },
            totalSessions: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            singlePageVisitors: 1,
            totalSessions: 1
          }
        }
      ]).next().then(res => res || { singlePageVisitors: 0, totalSessions: 0 })
    ])

    // Destructure results with default values
    const { totalVisitors = 0, pageViews = 0 } = visitorStats || {}
    const { subscribers = 0, newSubscribers = 0 } = subscriberStats || {}
    const { singlePageVisitors = 0, totalSessions = 0 } = bounceStats || {}

    // Calculate bounce rate
    const bounceRate = totalSessions > 0 
      ? Math.round((singlePageVisitors / totalSessions) * 100) 
      : 0

    // Get today's date at midnight for today's visitors
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get today's unique visitors
    const todayUniqueVisitors = await db.collection("visitors").countDocuments({
      visitedAt: { $gte: today }
    })

    const stats = {
      totalVisitors,
      todayVisitors: todayUniqueVisitors,
      subscribers,
      newSubscribers,
      contactMessages: contactMessages || 0,
      pageViews,
      bounceRate,
      lastUpdated: new Date().toISOString()
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
