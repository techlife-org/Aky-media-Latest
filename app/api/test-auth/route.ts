import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Get the first approved youth for testing
    const youth = await db.collection('youth').findOne({ 
      approvalStatus: 'approved' 
    });

    if (!youth) {
      return NextResponse.json({
        error: 'No approved youth found',
        suggestion: 'Please register a youth and approve them in admin dashboard'
      }, { status: 404 });
    }

    // Generate a test token
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
    const { password, ...safeYouthData } = youth;

    return NextResponse.json({
      success: true,
      message: 'Test authentication data generated',
      youth: safeYouthData,
      token: token,
      instructions: {
        step1: 'Copy the token below',
        step2: 'Open browser console on youth dashboard',
        step3: 'Run: localStorage.setItem("youthToken", "PASTE_TOKEN_HERE")',
        step4: 'Refresh the page'
      }
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'clear-tokens') {
      return NextResponse.json({
        success: true,
        message: 'Run this in browser console to clear tokens',
        script: `
localStorage.removeItem('youthToken');
localStorage.removeItem('youthData');
console.log('Tokens cleared');
window.location.href = '/youth-login';
        `
      });
    }

    if (action === 'approve-all') {
      const { db } = await connectToDatabase();
      
      const result = await db.collection('youth').updateMany(
        { approvalStatus: 'pending' },
        { 
          $set: { 
            approvalStatus: 'approved',
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: 'test-system'
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: `Approved ${result.modifiedCount} pending youth registrations`,
        modifiedCount: result.modifiedCount
      });
    }

    return NextResponse.json({
      error: 'Invalid action',
      availableActions: ['clear-tokens', 'approve-all']
    }, { status: 400 });

  } catch (error) {
    console.error('Test auth POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}