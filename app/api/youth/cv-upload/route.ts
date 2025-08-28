import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types for CV
const ALLOWED_CV_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
};

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

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
    const file = formData.get('cv') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No CV file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check file type
    const fileExtension = getFileExtension(file.name);
    if (!fileExtension || !(fileExtension in ALLOWED_CV_TYPES)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG' 
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const { url, public_id } = await uploadToCloudinary(file);

    const { db } = await connectToDatabase();

    // Update youth record with CV
    const result = await db.collection('youth').updateOne(
      { _id: new ObjectId(decoded.youthId) },
      {
        $set: {
          cv: {
            url,
            public_id,
            filename: file.name,
            uploadedAt: new Date()
          },
          cvUploaded: true,
          cvUploadedAt: new Date(),
          dashboardAccess: true, // Grant dashboard access after CV upload
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
      message: 'CV uploaded successfully',
      data: {
        url,
        filename: file.name,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}