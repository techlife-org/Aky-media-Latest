import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { YouthLoginRequest, YouthAuthResponse } from '@/models/Youth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export async function POST(request: Request) {
  try {
    const { uniqueId, password }: YouthLoginRequest = await request.json();

    if (!uniqueId || !password) {
      return NextResponse.json(
        { success: false, message: 'Unique ID and password are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find youth by unique ID
    const youth = await db.collection('youth').findOne({ uniqueId });

    if (!youth) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (youth.lockedUntil && youth.lockedUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((youth.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { 
          success: false, 
          message: `Account is locked. Try again in ${lockTimeRemaining} minutes.` 
        },
        { status: 423 }
      );
    }

    // Check if youth is approved
    if (youth.approvalStatus !== 'approved') {
      return NextResponse.json(
        { 
          success: false, 
          message: youth.approvalStatus === 'rejected' 
            ? 'Your registration has been rejected. Please contact support.' 
            : 'Your registration is still pending approval. Please wait for confirmation.'
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, youth.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const loginAttempts = (youth.loginAttempts || 0) + 1;
      const updateData: any = { 
        loginAttempts,
        updatedAt: new Date()
      };

      // Lock account if max attempts reached
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME);
      }

      await db.collection('youth').updateOne(
        { _id: youth._id },
        { $set: updateData }
      );

      return NextResponse.json(
        { 
          success: false, 
          message: loginAttempts >= MAX_LOGIN_ATTEMPTS 
            ? 'Account locked due to too many failed attempts. Try again in 2 hours.'
            : `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - loginAttempts} attempts remaining.`
        },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await db.collection('youth').updateOne(
      { _id: youth._id },
      { 
        $set: { 
          loginAttempts: 0,
          lastLogin: new Date(),
          lastActive: new Date(),
          updatedAt: new Date()
        },
        $unset: { lockedUntil: 1 }
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        youthId: youth._id.toString(),
        uniqueId: youth.uniqueId,
        email: youth.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    const { password: _, ...safeYouthData } = youth;

    const response: YouthAuthResponse = {
      success: true,
      youth: safeYouthData,
      token,
      message: 'Login successful'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Youth authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify token endpoint
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

    // Convert youthId string to ObjectId
    if (!ObjectId.isValid(decoded.youthId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const youth = await db.collection('youth').findOne({ 
      _id: new ObjectId(decoded.youthId)
    });

    if (!youth) {
      return NextResponse.json(
        { success: false, message: 'Invalid token or youth not found' },
        { status: 401 }
      );
    }

    // Update last active
    await db.collection('youth').updateOne(
      { _id: youth._id },
      { $set: { lastActive: new Date() } }
    );

    // Remove sensitive data
    const { password: _, ...safeYouthData } = youth;

    return NextResponse.json({
      success: true,
      youth: safeYouthData
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    let errorMessage = 'Invalid token';
    if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Invalid token format';
    } else if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token has expired. Please login again.';
    } else if (error instanceof jwt.NotBeforeError) {
      errorMessage = 'Token not active yet';
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 401 }
    );
  }
}