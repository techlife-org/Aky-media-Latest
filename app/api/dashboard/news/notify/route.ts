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
  content: string;
  doc_type: string;
  sentTo: number;
  sentAt: Date;
  type: "news_notification";
  status: "sent" | "partial";
  emailSubject: string;
  articleId?: ObjectId | null;
  subscribers: { email: string; name: string; mobile?: string }[];
  attachment?: {
    url: string;
    type: "image" | "document" | "video" | "link";
    name?: string;
  }
  failedRecipients?: { email: string; error: string }[];
  emailsSent: number;
  smsSent: number;
  whatsappSent: number;
  errors: string[];
}

export async function POST(request: Request) {
  try {
    const { newsId } = await request.json();

    if (!newsId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'News ID is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Get news article
    const news = await db.collection('news').findOne({ _id: new ObjectId(newsId) });

    if (!news) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'News article not found' }),
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

    console.log(`📢 Sending news notifications to ${subscribers.length} subscribers for: ${news.title}`);
    
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
          // Send news notifications using the enhanced service
          const notificationResults = await notificationService.sendNewsNotifications({
            email: subscriber.email,
            phone: subscriber.mobile,
            name: subscriber.name || 'Subscriber',
            newsTitle: news.title,
            newsContent: news.content,
            newsCategory: news.doc_type,
            newsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/news/${newsId}`,
            newsImage: news.attachment?.url
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
      title: news.title,
      content: typeof news.content === "string"
        ? news.content.substring(0, 200) + (news.content.length > 200 ? "..." : "")
        : "",
      doc_type: news.doc_type,
      sentTo: results.successful.length,
      sentAt: new Date(),
      type: "news_notification",
      status: results.failed.length === 0 ? "sent" : "partial",
      emailSubject: `📰 ${news.title} - The AKY Digital Team`,
      articleId: new ObjectId(newsId),
      subscribers: results.successful.map(result => ({
        email: result.subscriber.email,
        name: result.subscriber.name || "Subscriber",
        ...(result.subscriber.mobile && { mobile: result.subscriber.mobile }),
      })),
      ...(news.attachment ? { attachment: news.attachment } : {}),
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
    await db.collection("email_notifications").insertOne({
      ...notification,
      _id: notification._id,
      articleId: notification.articleId,
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

    console.log(`✅ News notification completed:`, {
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
        message: `News notification sent successfully! Reached ${results.successful.length} subscribers via email: ${results.emailsSent}, SMS: ${results.smsSent}, WhatsApp: ${results.whatsappSent}`,
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
    console.error('📢 News notification error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to send news notifications',
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