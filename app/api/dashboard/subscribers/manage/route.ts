import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb';
import { NotificationService } from '@/lib/notification-service';
import { z } from 'zod';

// Define validation schemas
const updateStatusSchema = z.object({
  subscriberId: z.string(),
  status: z.enum(['active', 'unsubscribed', 'terminated']),
  reason: z.string().optional()
});

const sendMessageSchema = z.object({
  subscriberId: z.string(),
  message: z.string().min(1, 'Message cannot be empty'),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp'])).min(1, 'At least one channel must be selected')
});

// Update subscriber status
async function updateSubscriberStatus(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { subscriberId, status, reason } = validation.data;

    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

    try {
      // Find the subscriber
      const subscriber = await db.collection("subscribers").findOne({ 
        _id: new ObjectId(subscriberId) 
      });

      if (!subscriber) {
        return NextResponse.json(
          { success: false, message: 'Subscriber not found' },
          { status: 404 }
        );
      }

      // Update subscriber status
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'unsubscribed') {
        updateData.unsubscribedAt = new Date();
        if (reason) updateData.unsubscribeReason = reason;
      } else if (status === 'terminated') {
        updateData.terminatedAt = new Date();
        if (reason) updateData.terminationReason = reason;
      } else if (status === 'active') {
        updateData.lastActive = new Date();
        updateData.$unset = {
          unsubscribedAt: "",
          unsubscribeReason: "",
          terminatedAt: "",
          terminationReason: ""
        };
      }

      await db.collection("subscribers").updateOne(
        { _id: new ObjectId(subscriberId) },
        { $set: updateData, ...(updateData.$unset && { $unset: updateData.$unset }) }
      );

      // Log the action
      await db.collection("subscriber_actions").insertOne({
        subscriberId: new ObjectId(subscriberId),
        action: 'status_change',
        details: { oldStatus: subscriber.status, newStatus: status, reason },
        performedBy: 'admin', // TODO: Get actual admin user
        performedAt: new Date()
      });

      // Send notifications based on status change
      try {
        const notificationService = new NotificationService();
        
        if (status === 'unsubscribed') {
          await notificationService.sendUnsubscribeNotifications(
            subscriber.email, 
            subscriber.phone, 
            subscriber.name
          );
        } else if (status === 'active' && subscriber.status !== 'active') {
          await notificationService.sendResubscribeNotifications(
            subscriber.email, 
            subscriber.phone, 
            subscriber.name
          );
        }
      } catch (notificationError) {
        console.error('Failed to send status change notifications:', notificationError);
      }

      return NextResponse.json({
        success: true,
        message: `Subscriber status updated to ${status}`,
        data: { subscriberId, status }
      });

    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscriber status' },
      { status: 500 }
    );
  }
}

// Send message to subscriber
async function sendMessageToSubscriber(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { subscriberId, message, channels } = validation.data;

    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

    try {
      // Find the subscriber
      const subscriber = await db.collection("subscribers").findOne({ 
        _id: new ObjectId(subscriberId) 
      });

      if (!subscriber) {
        return NextResponse.json(
          { success: false, message: 'Subscriber not found' },
          { status: 404 }
        );
      }

      if (subscriber.status !== 'active') {
        return NextResponse.json(
          { success: false, message: 'Cannot send message to inactive subscriber' },
          { status: 400 }
        );
      }

      // Send message through selected channels
      const results = {
        email: null as any,
        sms: null as any,
        whatsapp: null as any,
        errors: [] as string[]
      };

      try {
        const notificationService = new NotificationService();

        if (channels.includes('email')) {
          // TODO: Implement custom message email sending
          console.log('Sending email message to:', subscriber.email);
        }

        if (channels.includes('sms') && subscriber.phone) {
          // TODO: Implement custom SMS sending
          console.log('Sending SMS message to:', subscriber.phone);
        }

        if (channels.includes('whatsapp') && subscriber.phone) {
          // TODO: Implement custom WhatsApp sending
          console.log('Sending WhatsApp message to:', subscriber.phone);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        results.errors.push('Failed to send message');
      }

      // Log the action
      await db.collection("subscriber_actions").insertOne({
        subscriberId: new ObjectId(subscriberId),
        action: 'message',
        details: { message, channels, results },
        performedBy: 'admin', // TODO: Get actual admin user
        performedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data: { subscriberId, channels, results }
      });

    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Get subscriber details
async function getSubscriberDetails(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const subscriberId = url.searchParams.get('id');

    if (!subscriberId) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

    try {
      // Find the subscriber
      const subscriber = await db.collection("subscribers").findOne({ 
        _id: new ObjectId(subscriberId) 
      });

      if (!subscriber) {
        return NextResponse.json(
          { success: false, message: 'Subscriber not found' },
          { status: 404 }
        );
      }

      // Get subscriber actions
      const actions = await db.collection("subscriber_actions")
        .find({ subscriberId: new ObjectId(subscriberId) })
        .sort({ performedAt: -1 })
        .limit(20)
        .toArray();

      return NextResponse.json({
        success: true,
        data: {
          subscriber: {
            id: subscriber._id.toString(),
            email: subscriber.email,
            phone: subscriber.phone,
            name: subscriber.name,
            status: subscriber.status,
            subscribedAt: subscriber.subscribedAt,
            unsubscribedAt: subscriber.unsubscribedAt,
            source: subscriber.source,
            lastActive: subscriber.lastActive,
            emailVerified: subscriber.emailVerified,
            phoneVerified: subscriber.phoneVerified,
            preferences: subscriber.preferences,
            metadata: subscriber.metadata
          },
          actions: actions.map(action => ({
            id: action._id.toString(),
            action: action.action,
            details: action.details,
            performedBy: action.performedBy,
            performedAt: action.performedAt
          }))
        }
      });

    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Get subscriber details error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get subscriber details' },
      { status: 500 }
    );
  }
}

// Delete subscriber function
async function deleteSubscriber(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriberId, reason } = body;

    if (!subscriberId) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

    try {
      // Check if subscriber exists
      const subscriber = await db.collection('subscribers').findOne({
        _id: new ObjectId(subscriberId)
      });

      if (!subscriber) {
        return NextResponse.json(
          { success: false, message: 'Subscriber not found' },
          { status: 404 }
        );
      }

      // Log the deletion action
      await db.collection('subscriber_actions').insertOne({
        subscriberId: new ObjectId(subscriberId),
        action: 'deleted',
        reason: reason || 'Deleted by admin',
        performedBy: 'admin', // You can get this from session/auth
        performedAt: new Date(),
        subscriberData: {
          email: subscriber.email,
          name: subscriber.name,
          phone: subscriber.phone,
          status: subscriber.status
        }
      });

      // Delete the subscriber
      const result = await db.collection('subscribers').deleteOne({
        _id: new ObjectId(subscriberId)
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Failed to delete subscriber' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber deleted successfully',
        data: {
          deletedSubscriber: {
            id: subscriberId,
            email: subscriber.email,
            name: subscriber.name
          }
        }
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete subscriber',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (!action || !['send-message', 'update-status', 'get-details', 'delete-subscriber'].includes(action)) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing action parameter' },
      { status: 400 }
    );
  }

  switch (action) {
    case 'update-status':
      return updateSubscriberStatus(request);
    case 'send-message':
      return sendMessageToSubscriber(request);
    case 'delete-subscriber':
      return deleteSubscriber(request);
    default:
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
  }
}

export async function GET(request: NextRequest) {
  return getSubscriberDetails(request);
}