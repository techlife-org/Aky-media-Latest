import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
          timestamp: new Date().toISOString()
        },
        { status: 503 },
      )
    }

    // Get total videos count
    const totalVideos = await db.collection("videos").countDocuments()
    
    // Get total views (sum of all video views)
    const videosWithViews = await db.collection("videos").find({ views: { $exists: true } }).toArray()
    const totalViews = videosWithViews.reduce((sum, video) => sum + (video.views || 0), 0)
    
    // Get featured videos count
    const featuredVideos = await db.collection("videos").countDocuments({ featured: true })
    
    // Get videos by category - return count of categories, not the categories themselves
    const categories = await db.collection("videos").distinct("category")
    const categoryCount = Array.isArray(categories) ? categories.length : 0
    
    // Get most viewed video
    const mostViewedVideo = await db.collection("videos")
      .find({ views: { $exists: true, $gt: 0 } })
      .sort({ views: -1 })
      .limit(1)
      .toArray()
    
    const stats = {
      totalVideos,
      totalViews,
      featuredVideos,
      categories: categoryCount, // Return count instead of object with keys
      mostViewedVideo: mostViewedVideo.length > 0 ? {
        id: mostViewedVideo[0]._id?.toString() || '',
        title: mostViewedVideo[0].title || 'Unknown',
        views: mostViewedVideo[0].views || 0
      } : null,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Error fetching video stats:", error)
    return NextResponse.json({ 
      error: "Failed to fetch video stats",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Increment view count for a specific video
export async function POST(req: Request) {
  try {
    const { videoId } = await req.json()

    if (!videoId || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ 
        error: "Valid Video ID is required",
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
          timestamp: new Date().toISOString()
        },
        { status: 503 },
      )
    }

    // Increment the view count for the video
    const result = await db.collection("videos").updateOne(
      { _id: new ObjectId(videoId) },
      { $inc: { views: 1 } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: "Video not found",
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Get the updated video to return current view count
    const updatedVideo = await db.collection("videos").findOne({ _id: new ObjectId(videoId) })
    
    return NextResponse.json({
      success: true,
      message: "View count incremented",
      views: updatedVideo?.views || 0,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating video views:", error)
    return NextResponse.json({ 
      error: "Failed to update video views",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}