import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Get only active programs
    const programs = await db.collection('programs')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: programs
    });

  } catch (error) {
    console.error('Error fetching programs for youth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}