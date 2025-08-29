import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    const { db } = await connectToDatabase();

    let matchStage = {};
    if (programId && ObjectId.isValid(programId)) {
      matchStage = { programId: new ObjectId(programId) };
    }

    // Get applications with program and youth details
    const applications = await db.collection('applications')
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'programs',
            localField: 'programId',
            foreignField: '_id',
            as: 'program'
          }
        },
        {
          $lookup: {
            from: 'youth',
            localField: 'youthId',
            foreignField: '_id',
            as: 'youth'
          }
        },
        { $unwind: '$program' },
        { $unwind: '$youth' },
        {
          $project: {
            'youth.password': 0, // Remove sensitive data
            'youth.ninNumber': 0
          }
        },
        { $sort: { appliedAt: -1 } }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId || !ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { error: 'Valid application ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(applicationId) },
      { 
        $set: {
          ...updateData,
          statusUpdatedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: 'admin', // In real app, get from auth
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get updated application for notifications
    const application = await db.collection('applications')
      .aggregate([
        { $match: { _id: new ObjectId(applicationId) } },
        {
          $lookup: {
            from: 'programs',
            localField: 'programId',
            foreignField: '_id',
            as: 'program'
          }
        },
        {
          $lookup: {
            from: 'youth',
            localField: 'youthId',
            foreignField: '_id',
            as: 'youth'
          }
        },
        { $unwind: '$program' },
        { $unwind: '$youth' }
      ])
      .toArray();

    if (application.length > 0) {
      const app = application[0];
      console.log(`📧 Application status updated: ${app.fullName} - ${app.program.title} - Status: ${updateData.status}`);
      
      // TODO: Send status update notification
      // await sendStatusUpdateNotification(app);
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}