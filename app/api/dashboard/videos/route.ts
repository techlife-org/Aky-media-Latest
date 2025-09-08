import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from "@/lib/video-utils"

interface Video {
  _id?: ObjectId // MongoDB ObjectId
  id: string // String representation of _id for client-side
  title: string
  description: string
  videoUrl: string // Original URL from user
  thumbnail: string | null
  category: string
  createdAt: Date
  updatedAt: Date
  views?: number
  duration?: string
  featured?: boolean
}

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

    const videos = await db.collection("videos").find({}).sort({ createdAt: -1 }).toArray()

    // Map MongoDB ObjectId to string 'id' for client-side consumption
    const formattedVideos = videos.map((video) => {
      // Ensure all fields are properly serialized
      const formattedVideo: any = {
        id: video._id?.toString() || '',
        title: video.title || '',
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        thumbnail: video.thumbnail || null,
        category: video.category || 'Other',
        createdAt: video.createdAt ? new Date(video.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: video.updatedAt ? new Date(video.updatedAt).toISOString() : new Date().toISOString(),
      }
      
      // Add optional fields if they exist
      if (video.views !== undefined) {
        formattedVideo.views = video.views
      }
      if (video.duration !== undefined) {
        formattedVideo.duration = video.duration
      }
      if (video.featured !== undefined) {
        formattedVideo.featured = video.featured
      }
      
      return formattedVideo
    })

    return NextResponse.json(formattedVideos, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ 
      error: "Failed to fetch videos",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, videoUrl, thumbnail, category, featured } = await req.json()

    if (!title || !description || !videoUrl || !category) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["title", "description", "videoUrl", "category"],
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

    let finalThumbnail = thumbnail
    if (!finalThumbnail && isYouTubeUrl(videoUrl)) {
      const youtubeId = getYouTubeId(videoUrl)
      if (youtubeId) {
        finalThumbnail = getYouTubeThumbnail(youtubeId)
      }
    }

    const newVideo = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      thumbnail: finalThumbnail || null,
      category: category.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      featured: Boolean(featured)
    }

    const result = await db.collection("videos").insertOne(newVideo)

    if (!result.insertedId) {
      throw new Error("Failed to insert video into database")
    }

    const insertedVideo = await db.collection("videos").findOne({ _id: result.insertedId })

    if (!insertedVideo) {
      throw new Error("Failed to retrieve inserted video")
    }

    // Format the response properly
    const formattedVideo: any = {
      id: insertedVideo._id.toString(),
      title: insertedVideo.title,
      description: insertedVideo.description,
      videoUrl: insertedVideo.videoUrl,
      thumbnail: insertedVideo.thumbnail,
      category: insertedVideo.category,
      createdAt: insertedVideo.createdAt.toISOString(),
      updatedAt: insertedVideo.updatedAt.toISOString(),
      views: insertedVideo.views || 0,
      featured: insertedVideo.featured || false
    }

    return NextResponse.json(formattedVideo, { status: 201 })
  } catch (error) {
    console.error("Error adding video:", error)
    return NextResponse.json({ 
      error: "Failed to add video",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}