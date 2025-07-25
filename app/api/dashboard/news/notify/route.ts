import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { corsHeaders } from '@/lib/cors';

interface Subscriber {
  _id: ObjectId;
  email: string;
  name?: string;
  status: 'active' | 'pending' | 'inactive';
}

interface RequestBody {
  id?: string
  title: string
  content: string
  doc_type: string
  attachment?: {
    url: string
    type: "image" | "document" | "video" | "link"
    name?: string
  }
}

interface Notification {
  _id: ObjectId
  title: string
  content: string
  doc_type: string
  sentTo: number
  sentAt: Date
  type: "news_notification"
  status: "sent" | "partial"
  emailSubject: string
  articleId?: ObjectId | null;
  subscribers: { email: string; name: string; mobile?: string }[] 
  attachment?: {
    url: string
    type: "image" | "document" | "video" | "link"
    name?: string
  }
  failedRecipients?: { email: string; error: string }[]
}

export async function POST(request: NextRequest) {
  try {
    const { id, title, content, doc_type, attachment } = (await request.json()) as RequestBody
    if (!id) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'News ID is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to MongoDB
    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

    // Get news article
    const news = await db.collection('news').findOne({ _id: new ObjectId(id) });
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

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Send emails
    const results = await Promise.all(
      subscribers.map(async (sub) => {
        try {
          await transporter.sendMail({
            from: `"AKY Media Center" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: sub.email,
            subject: `New Update: ${title}`,
            html: generateEmailHtml({ title, content, attachment, _id: id }, sub.name || 'Subscriber')
          });
          return { success: true, email: sub.email };
        } catch (error) {
          return { success: false, email: sub.email, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Log results
    console.log(`Sent ${successful.length} emails, ${failed.length} failed`);

    // Store notification record
    const notification: Notification = {
      _id: new ObjectId(),
      title,
      content: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      doc_type,
      sentTo: successful.length,
      sentAt: new Date(),
      type: "news_notification",
      status: failed.length === 0 ? "sent" : "partial",
      emailSubject: `New Update: ${title}`,
      articleId: id ? new ObjectId(id) : null,
      subscribers: successful.map((_, index) => ({
        email: subscribers[index].email,
        name: subscribers[index].name || "Subscriber",
        ...(subscribers[index].mobile && { mobile: subscribers[index].mobile }),
      })),
      ...(attachment ? { attachment } : {}),
      ...(failed.length > 0 && { failedRecipients: failed.map(result => ({ email: result.email, error: result.error })) }),
    };

    // Save notification to database
    await db.collection("email_notifications").insertOne({
      ...notification,
      _id: notification._id,
      articleId: notification.articleId,
    });

    // Update subscriber engagement
    if (successful.length > 0) {
      await db.collection<Subscriber>("subscribers").updateMany(
        {
          _id: { $in: successful.map((_, index) => subscribers[index]._id) },
        } as any,
        { $inc: { emailsReceived: 1 }, $set: { lastEmailSent: new Date() } } as any,
      )
    }

    // Insert notification into notifications collection
    await db.collection("notifications").insertOne(notification);

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${successful.length} subscribers`,
        sent: successful.length,
        failed: failed.length
      }),
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to process notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

function generateEmailHtml(news: any, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const newsUrl = `${baseUrl}/news/${news._id}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 20px; text-align: center; color: white;">
        <h1>AKY Media Center</h1>
        <p>Latest Update from Governor Abba Kabir Yusuf</p>
      </div>
      <div style="padding: 20px; background: white;">
        <h2 style="color: #1f2937; margin-top: 0;">${news.title}</h2>
        ${news.attachment?.url && news.attachment.type === 'image' ? 
          `<div style="margin: 15px 0;">
            <img src="${news.attachment.url}" alt="${news.title}" style="max-width: 100%; border-radius: 4px;">
          </div>` : ''
        }
        <p style="color: #4b5563; line-height: 1.6;">
          ${news.content.substring(0, 200)}...
        </p>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${newsUrl}" style="
            display: inline-block; 
            padding: 12px 24px; 
            background: #dc2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px;
            font-weight: bold;
          ">
            Read Full Story
          </a>
        </div>
      </div>
      <div style="padding: 15px; background: #f8fafc; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} AKY Media Center. All rights reserved.</p>
        <p>
          <a href="${baseUrl}/unsubscribe" style="color: #666; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}
