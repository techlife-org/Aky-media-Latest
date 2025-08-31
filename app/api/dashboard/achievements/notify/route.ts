import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { corsHeaders } from '@/lib/cors';
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service';
import { connectToDatabase } from '@/lib/mongodb';

interface Subscriber {
  _id: ObjectId;
  email: string;
  name?: string;
  mobile?: string;
  status: 'active' | 'pending' | 'inactive';
}

interface Notification {
  _id: ObjectId;
  title: string;
  description: string;
  category: string;
  progress: number;
  location: string;
  date: string;
  sentTo: number;
  sentAt: Date;
  type: "achievement_notification";
  status: "sent" | "partial";
  emailSubject: string;
  achievementId?: ObjectId | null;
  subscribers: { email: string; name: string; mobile?: string }[];
  images?: string[];
  failedRecipients?: { email: string; error: string }[];
  emailsSent: number;
  smsSent: number;
  whatsappSent: number;
  errors: string[];
}

export async function POST(request: Request) {
  try {
    const { achievementId } = await request.json();

    if (!achievementId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Achievement ID is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Get achievement
    const achievement = await db.collection('achievements').findOne({ _id: new ObjectId(achievementId) });

    if (!achievement) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Achievement not found' }),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get active subscribers
    const subscribers = await db
      .collection<Subscriber>('subscribers')
      .find({
        status: { $in: ['active', 'pending'] },
        email: { $exists: true, $ne: '' }
      })
      .toArray()
      .catch(() => []);

    if (subscribers.length === 0) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'No active subscribers found' }),
        { status: 200, headers: corsHeaders() }
      );
    }

    console.log(`🏆 Sending achievement notifications to ${subscribers.length} subscribers for: ${achievement.title}`);
    
    // Initialize notification service
    const notificationService = new EnhancedNotificationService();
    
    // Track results
    const results = {
      emailsSent: 0,
      smsSent: 0,
      whatsappSent: 0,
      errors: [] as string[],
      successful: [] as any[],
      failed: [] as any[]
    };

    // Process subscribers in batches to avoid overwhelming the system
    const BATCH_SIZE = 10;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          // Send achievement notifications using the enhanced service
          const notificationResults = await notificationService.sendAchievementNotifications({
            email: subscriber.email,
            phone: subscriber.mobile,
            name: subscriber.name || 'Subscriber',
            achievementTitle: achievement.title,
            achievementDescription: achievement.description,
            achievementCategory: achievement.category,
            achievementProgress: achievement.progress || 0,
            achievementLocation: achievement.location,
            achievementDate: new Date(achievement.date).toLocaleDateString(),
            achievementUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/achievements/${achievementId}`,
            achievementImage: achievement.images?.[0]
          });

          // Track successful notifications
          if (notificationResults.email?.success) {
            results.emailsSent++;
          }
          if (notificationResults.sms?.success) {
            results.smsSent++;
          }
          if (notificationResults.whatsapp?.success) {
            results.whatsappSent++;
          }
          
          // Collect any errors
          if (notificationResults.errors && notificationResults.errors.length > 0) {
            results.errors.push(...notificationResults.errors);
          }
          
          const hasSuccess = notificationResults.email?.success || 
                           notificationResults.sms?.success || 
                           notificationResults.whatsapp?.success;
          
          return {
            subscriber,
            results: notificationResults,
            success: hasSuccess
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Failed to notify ${subscriber.email}: ${errorMsg}`);
          return {
            subscriber,
            success: false,
            error: errorMsg
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Categorize results
      batchResults.forEach(result => {
        if (result.success) {
          results.successful.push(result);
        } else {
          results.failed.push(result);
        }
      });
      
      // Add delay between batches to be respectful to external services
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Create notification record
    const notification: Notification = {
      _id: new ObjectId(),
      title: achievement.title,
      description: typeof achievement.description === "string"
        ? achievement.description.substring(0, 200) + (achievement.description.length > 200 ? "..." : "")
        : "",
      category: achievement.category,
      progress: achievement.progress || 0,
      location: achievement.location,
      date: achievement.date,
      sentTo: results.successful.length,
      sentAt: new Date(),
      type: "achievement_notification",
      status: results.failed.length === 0 ? "sent" : "partial",
      emailSubject: `🏆 ${achievement.title} - The AKY Digital Team`,
      achievementId: new ObjectId(achievementId),
      subscribers: results.successful.map(result => ({
        email: result.subscriber.email,
        name: result.subscriber.name || "Subscriber",
        ...(result.subscriber.mobile && { mobile: result.subscriber.mobile }),
      })),
      ...(achievement.images && achievement.images.length > 0 ? { images: achievement.images } : {}),
      ...(results.failed.length > 0 && { 
        failedRecipients: results.failed.map(result => ({ 
          email: result.subscriber.email, 
          error: result.error || 'Unknown error' 
        })) 
      }),
      emailsSent: results.emailsSent,
      smsSent: results.smsSent,
      whatsappSent: results.whatsappSent,
      errors: results.errors
    };

    // Save notification to database
    await db.collection("achievement_notifications").insertOne({
      ...notification,
      _id: notification._id,
      achievementId: notification.achievementId,
    });

    // Update subscriber engagement for successful notifications
    if (results.successful.length > 0) {
      const successfulSubscriberIds = results.successful.map(result => result.subscriber._id);
      await db.collection<Subscriber>("subscribers").updateMany(
        { _id: { $in: successfulSubscriberIds } },
        { 
          $inc: { emailsReceived: 1 }, 
          $set: { lastEmailSent: new Date() } 
        }
      );
    }

    // Insert notification into notifications collection
    await db.collection("notifications").insertOne(notification);

    console.log(`✅ Achievement notification completed:`, {
      total: subscribers.length,
      successful: results.successful.length,
      failed: results.failed.length,
      emailsSent: results.emailsSent,
      smsSent: results.smsSent,
      whatsappSent: results.whatsappSent,
      errors: results.errors.length
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Achievement notification sent successfully! Reached ${results.successful.length} subscribers via email: ${results.emailsSent}, SMS: ${results.smsSent}, WhatsApp: ${results.whatsappSent}`,
        data: {
          total: subscribers.length,
          successful: results.successful.length,
          failed: results.failed.length,
          emailsSent: results.emailsSent,
          smsSent: results.smsSent,
          whatsappSent: results.whatsappSent,
          notificationId: notification._id,
          errors: results.errors
        }
      }),
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('🏆 Achievement notification error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to send achievement notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}