import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from "@/lib/video-utils"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, description, videoUrl, thumbnail, category, featured } = await req.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Video ID is required" }, { status: 400 });
    }

    if (!title || !description || !videoUrl || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 }
      );
    }

    let finalThumbnail = thumbnail;
    if (!finalThumbnail && isYouTubeUrl(videoUrl)) {
      const youtubeId = getYouTubeId(videoUrl);
      if (youtubeId) {
        finalThumbnail = getYouTubeThumbnail(youtubeId);
      }
    }

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      thumbnail: finalThumbnail,
      category: category.trim(),
      featured: Boolean(featured),
      updatedAt: new Date(),
    };

    const result = await db.collection("videos").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updatedVideo = await db.collection("videos").findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...updatedVideo,
      id: updatedVideo._id.toString(),
      createdAt: updatedVideo.createdAt.toISOString(),
      updatedAt: updatedVideo.updatedAt.toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Video ID is required" }, { status: 400 });
    }

    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 }
      );
    }

    const result = await db.collection("videos").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}