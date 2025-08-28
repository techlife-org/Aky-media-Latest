import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Get only active videos
    const videos = await db.collection('videos')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Error fetching videos for youth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}