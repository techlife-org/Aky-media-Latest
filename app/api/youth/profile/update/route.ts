import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: Request) {
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

    const { fullName, email, phone, occupation } = await request.json();

    // Validate required fields
    if (!fullName || !email || !phone || !occupation) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if email is already taken by another user
    const existingUser = await db.collection('youth').findOne({
      email: email.toLowerCase(),
      _id: { $ne: new ObjectId(decoded.youthId) }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already taken by another user' },
        { status: 400 }
      );
    }

    // Update the youth profile
    const result = await db.collection('youth').updateOne(
      { _id: new ObjectId(decoded.youthId) },
      {
        $set: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          occupation: occupation.trim(),
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

    // Get updated youth data
    const updatedYouth = await db.collection('youth').findOne(
      { _id: new ObjectId(decoded.youthId) },
      { projection: { password: 0, ninNumber: 0 } } // Exclude sensitive data
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      youth: updatedYouth
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}