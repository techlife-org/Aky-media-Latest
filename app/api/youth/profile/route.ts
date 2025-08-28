import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');
    const email = searchParams.get('email');

    if (!uniqueId && !email) {
      return NextResponse.json(
        { error: 'Either uniqueId or email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Build query based on provided parameters
    const query: any = {};
    if (uniqueId) {
      query.uniqueId = uniqueId;
    } else if (email) {
      query.email = email.toLowerCase();
    }

    // Find youth record
    const youth = await db.collection('youth').findOne(query);

    if (!youth) {
      return NextResponse.json(
        { error: 'Youth record not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information before sending response
    const { ninDocument, ...safeYouthData } = youth;
    
    // Only include document URL, not the full document details
    const responseData = {
      ...safeYouthData,
      ninDocumentUrl: ninDocument?.url || null,
      hasNinDocument: !!ninDocument?.url
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching youth profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');

    if (!uniqueId) {
      return NextResponse.json(
        { error: 'uniqueId is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Only allow certain fields to be updated
    const allowedFields = ['phone', 'occupation', 'notifications'];
    const filteredUpdateData: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    if (Object.keys(filteredUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    filteredUpdateData.updatedAt = new Date();

    const { db } = await connectToDatabase();

    // Update youth record
    const result = await db.collection('youth').updateOne(
      { uniqueId },
      { $set: filteredUpdateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Youth record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating youth profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}