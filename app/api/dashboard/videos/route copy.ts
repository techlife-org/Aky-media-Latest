// app/api/dashboard/videos/route.ts
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

interface Video {
  _id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string | null;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name if different from default
    const videos = await db.collection('videos')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert _id to string for JSON serialization
    const serializedVideos = videos.map(video => ({
      ...video,
      _id: video._id.toString(),
      id: video._id.toString(),
      createdAt: video.createdAt?.toISOString(),
      updatedAt: video.updatedAt?.toISOString(),
    }));

    return NextResponse.json(serializedVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, videoUrl, thumbnail, category } = await request.json();
    
    if (!title || !description || !videoUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const videoData: Omit<Video, '_id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      videoUrl,
      thumbnail: thumbnail || null,
      category,
    };

    const result = await db.collection('videos').insertOne({
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newVideo: Video = {
      ...videoData,
      _id: result.insertedId.toString(),
      id: result.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const { ObjectId } = await import('mongodb');
    const result = await db.collection('videos').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}