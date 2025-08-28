import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    const programs = await db.collection('programs')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: programs
    });

  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const programData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'duration', 'location'];
    for (const field of requiredFields) {
      if (!programData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();

    const program = {
      ...programData,
      _id: new ObjectId(),
      status: programData.status || 'active',
      currentParticipants: 0,
      totalApplications: 0,
      applicationRequired: programData.applicationRequired || false,
      requiredDocuments: programData.requiredDocuments || [],
      customQuestions: programData.customQuestions || [],
      targetOccupations: programData.targetOccupations || [],
      requirements: programData.requirements || [],
      benefits: programData.benefits || [],
      applicationDeadline: programData.applicationDeadline ? new Date(programData.applicationDeadline) : undefined,
      startDate: programData.startDate ? new Date(programData.startDate) : undefined,
      endDate: programData.endDate ? new Date(programData.endDate) : undefined,
      createdBy: 'admin', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('programs').insertOne(program);

    return NextResponse.json({
      success: true,
      data: program,
      message: 'Program created successfully'
    });

  } catch (error) {
    console.error('Error creating program:', error);
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
        { error: 'Valid program ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('programs').updateOne(
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
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully'
    });

  } catch (error) {
    console.error('Error updating program:', error);
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
        { error: 'Valid program ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('programs').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}