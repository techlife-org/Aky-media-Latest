import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Get all youth registrations
    const youth = await db.collection('youth')
      .find({})
      .sort({ registeredAt: -1 })
      .toArray();

    // Remove sensitive data
    const safeYouth = youth.map(y => {
      const { password, ...safeData } = y;
      return safeData;
    });

    return NextResponse.json({
      success: true,
      data: safeYouth
    });

  } catch (error) {
    console.error('Error fetching youth data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}