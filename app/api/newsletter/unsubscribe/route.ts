import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb';
import { withCors } from "@/lib/cors"
import { NotificationService } from '@/lib/notification-service';
import { z } from 'zod';

// Define validation schema
const unsubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().optional()
});

async function handler(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate request data
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, reason } = validation.data;

    // Connect to MongoDB
    let client;
    try {
      client = await new MongoClient(process.env.MONGODB_URI!).connect();
      const db = client.db(process.env.MONGODB_DB);

      // Find the subscriber
      const subscriber = await db.collection("subscribers").findOne({ 
        email: { $regex: `^${email}$`, $options: 'i' } // Case-insensitive match
      });

      if (!subscriber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email address not found in our subscriber list.'
          }, 
          { status: 404 }
        );
      }

      if (subscriber.status === 'unsubscribed') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'This email is already unsubscribed.'
          }, 
          { status: 400 }
        );
      }

      // Update subscriber status to unsubscribed
      await db.collection("subscribers").updateOne(
        { _id: subscriber._id },
        { 
          $set: { 
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
            unsubscribeReason: reason || null,
            updatedAt: new Date()
          } 
        }
      );

      // Send unsubscribe confirmation notifications
      try {
        const notificationService = new NotificationService();
        await notificationService.sendUnsubscribeNotifications(
          subscriber.email, 
          subscriber.phone, 
          subscriber.name
        );
      } catch (notificationError) {
        console.error('Failed to send unsubscribe notifications:', notificationError);
        // Log the error but don't fail the request
        await db.collection("notification_errors").insertOne({
          type: 'unsubscribe_notifications',
          subscriberId: subscriber._id,
          email: subscriber.email,
          phone: subscriber.phone,
          error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
          timestamp: new Date()
        });
      }

      return NextResponse.json({
        success: true,
        message: "You have been successfully unsubscribed from our newsletter.",
        data: { email }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to process unsubscribe request. Please try again later.',
          error: process.env.NODE_ENV === 'development' ? dbError instanceof Error ? dbError.message : 'Unknown error' : undefined
        }, 
        { status: 500 }
      );
    } finally {
      if (client) {
        await client.close();
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again later.'
      }, 
      { status: 500 }
    );
  }
}

export const POST = withCors(handler);

export const OPTIONS = withCors(async () => 
  new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
);