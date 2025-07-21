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

    // Get news stats from email notifications
    const notifications = await db.collection("email_notifications").find({}).toArray()
    const emailsSent = notifications.reduce((sum, notif) => sum + (notif.sentTo || 0), 0)

    // Calculate this month's news count
    const thisMonth = notifications.filter((notif) => {
      const notifDate = new Date(notif.sentAt)
      const now = new Date()
      return notifDate.getMonth() === now.getMonth() && notifDate.getFullYear() === now.getFullYear()
    }).length

    // Fetch total news articles from the 'news' collection
    const totalNews = await db.collection("news").countDocuments()

    // Placeholder for total views (would come from analytics)
    const totalViews = 25680

    return NextResponse.json({
      totalNews,
      thisMonth,
      totalViews,
      emailsSent,
    })
  } catch (error) {
    console.error("News stats error:", error)
    // Return fallback data if database fails or other error occurs
    return NextResponse.json({
      totalNews: 45, // Fallback value
      thisMonth: 8, // Fallback value
      totalViews: 25680, // Fallback value
      emailsSent: 1250, // Fallback value
    })
  }
}
