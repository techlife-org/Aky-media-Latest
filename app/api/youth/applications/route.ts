import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadToCloudinary } from '@/lib/cloudinary';
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

    if (!ObjectId.isValid(decoded.youthId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const programId = formData.get('programId') as string;
    const customResponsesStr = formData.get('customResponses') as string;
    
    if (!programId || !ObjectId.isValid(programId)) {
      return NextResponse.json(
        { success: false, message: 'Valid program ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get youth data
    const youth = await db.collection('youth').findOne({ 
      _id: new ObjectId(decoded.youthId) 
    });

    if (!youth) {
      return NextResponse.json(
        { success: false, message: 'Youth not found' },
        { status: 404 }
      );
    }

    // Get program data
    const program = await db.collection('programs').findOne({ 
      _id: new ObjectId(programId) 
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if application deadline has passed
    if (program.applicationDeadline && new Date() > new Date(program.applicationDeadline)) {
      return NextResponse.json(
        { success: false, message: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if youth has already applied
    const existingApplication = await db.collection('applications').findOne({
      programId: new ObjectId(programId),
      youthId: new ObjectId(decoded.youthId)
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied to this program' },
        { status: 400 }
      );
    }

    // Parse custom responses
    let customResponses = [];
    if (customResponsesStr) {
      try {
        customResponses = JSON.parse(customResponsesStr);
      } catch (error) {
        console.error('Error parsing custom responses:', error);
      }
    }

    // Handle file uploads
    const additionalDocuments = [];
    const cvFile = formData.get('cv') as File | null;
    let cvDocument = null;

    // Upload CV if provided
    if (cvFile) {
      const { url, public_id } = await uploadToCloudinary(cvFile);
      cvDocument = {
        url,
        public_id,
        filename: cvFile.name,
        uploadedAt: new Date()
      };
    }

    // Upload additional documents
    const documentTypes = ['cover_letter', 'certificates', 'portfolio', 'other'];
    for (const docType of documentTypes) {
      const file = formData.get(docType) as File | null;
      if (file) {
        const { url, public_id } = await uploadToCloudinary(file);
        additionalDocuments.push({
          url,
          public_id,
          filename: file.name,
          type: docType,
          uploadedAt: new Date()
        });
      }
    }

    // Create application
    const application = {
      _id: new ObjectId(),
      programId: new ObjectId(programId),
      youthId: new ObjectId(decoded.youthId),
      fullName: youth.fullName,
      email: youth.email,
      phone: youth.phone,
      uniqueId: youth.uniqueId,
      cv: cvDocument,
      additionalDocuments,
      customResponses,
      status: 'new' as const,
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('applications').insertOne(application);

    // Update program application count
    await db.collection('programs').updateOne(
      { _id: new ObjectId(programId) },
      { $inc: { totalApplications: 1 } }
    );

    // TODO: Send confirmation email/SMS to youth
    console.log(`📧 Application submitted: ${youth.fullName} applied to ${program.title}`);

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting application:', error);
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

    if (!ObjectId.isValid(decoded.youthId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Get youth's applications with program details
    const applications = await db.collection('applications')
      .aggregate([
        { $match: { youthId: new ObjectId(decoded.youthId) } },
        {
          $lookup: {
            from: 'programs',
            localField: 'programId',
            foreignField: '_id',
            as: 'program'
          }
        },
        { $unwind: '$program' },
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
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}