import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(decoded.youthId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const onboardingData = await request.json();

    // Update youth record with onboarding completion
    const result = await db.collection('youth').updateOne(
      { _id: new ObjectId(decoded.youthId) },
      {
        $set: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          // Store any additional onboarding data
          ...onboardingData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Youth not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(decoded.youthId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const youth = await db.collection('youth').findOne(
      { _id: new ObjectId(decoded.youthId) },
      { projection: { onboardingCompleted: 1, cvUploaded: 1, dashboardAccess: 1 } }
    );

    if (!youth) {
      return NextResponse.json(
        { success: false, message: 'Youth not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        onboardingCompleted: youth.onboardingCompleted || false,
        cvUploaded: youth.cvUploaded || false,
        dashboardAccess: youth.dashboardAccess || false
      }
    });

  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}