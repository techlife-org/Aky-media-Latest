import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    const music = await db.collection('music')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: music
    });

  } catch (error) {
    console.error('Error fetching music:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const musicData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'artist', 'genre', 'audioUrl', 'duration'];
    for (const field of requiredFields) {
      if (!musicData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();

    const music = {
      ...musicData,
      _id: new ObjectId(),
      status: musicData.status || 'active',
      playCount: 0,
      likes: 0,
      isExplicit: musicData.isExplicit || false,
      tags: musicData.tags || [],
      createdBy: 'admin', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('music').insertOne(music);

    return NextResponse.json({
      success: true,
      data: music,
      message: 'Music created successfully'
    });

  } catch (error) {
    console.error('Error creating music:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid music ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('music').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Music not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Music updated successfully'
    });

  } catch (error) {
    console.error('Error updating music:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid music ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('music').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Music not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Music deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting music:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}