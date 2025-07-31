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
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    const videos = await db.collection<Video>("videos").find({}).sort({ createdAt: -1 }).toArray()

    // Map MongoDB ObjectId to string 'id' for client-side consumption
    const formattedVideos = videos.map((video) => ({
      ...video,
      id: video._id!.toString(), // Ensure _id exists and convert to string
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, videoUrl, thumbnail, category } = await req.json()

    if (!title || !description || !videoUrl || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    let finalThumbnail = thumbnail
    if (!finalThumbnail && isYouTubeUrl(videoUrl)) {
      const youtubeId = getYouTubeId(videoUrl)
      if (youtubeId) {
        finalThumbnail = getYouTubeThumbnail(youtubeId)
      }
    }

    const newVideo: Omit<Video, "_id" | "id"> = {
      title,
      description,
      videoUrl,
      thumbnail: finalThumbnail,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Video>("videos").insertOne(newVideo as any) // Type assertion for _id

    if (!result.insertedId) {
      throw new Error("Failed to insert video into database")
    }

    const insertedVideo = await db.collection<Video>("videos").findOne({ _id: result.insertedId })

    if (!insertedVideo) {
      throw new Error("Failed to retrieve inserted video")
    }

    return NextResponse.json(
      {
        ...insertedVideo,
        id: insertedVideo._id.toString(), // Convert ObjectId to string for client
        createdAt: insertedVideo.createdAt.toISOString(),
        updatedAt: insertedVideo.updatedAt.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding video:", error)
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Video ID is required" }, { status: 400 })
    }

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

    const result = await db.collection<Video>("videos").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
