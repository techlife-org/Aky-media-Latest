import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { corsHeaders } from "@/lib/cors"

export async function GET() {
  try {
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error('Database connection error:', error);
      // Return a default response when database is not available
      return NextResponse.json({
        message: "Service temporarily unavailable. Please try again later.",
        success: false
      }, { status: 503 });
    }

    // Get system statistics
    const [subscribersCount, messagesCount, visitorsCount] = await Promise.all([
      db.collection("subscribers").countDocuments(),
      db.collection("contact_messages").countDocuments(),
      db.collection("visitors").countDocuments(),
    ])

    // Get recent activity
    const recentActivity = await db.collection("email_notifications").find({}).sort({ sentAt: -1 }).limit(1).toArray()

    const stats = {
      totalUsers: 1, // Admin user
      totalSubscribers: subscribersCount,
      totalNews: 45, // This would come from your blog API
      totalMessages: messagesCount,
      totalVisitors: visitorsCount,
      storageUsed: "2.3 MB",
      lastBackup: recentActivity.length > 0 ? recentActivity[0].sentAt.toLocaleDateString() : "Never",
      systemStatus: "online",
    }

    return NextResponse.json(stats, { headers: corsHeaders })
  } catch (error) {
    console.error("System stats error:", error)
    return NextResponse.json(
      {
        totalUsers: 1,
        totalSubscribers: 0,
        totalNews: 0,
        totalMessages: 0,
        totalVisitors: 0,
        storageUsed: "0 MB",
        lastBackup: "Never",
        systemStatus: "error",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}
