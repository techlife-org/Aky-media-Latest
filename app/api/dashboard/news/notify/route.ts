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
  newsId: string;
  title: string;
  content: string;
  doc_type: string;
  attachment?: {
    url: string;
    type: "image" | "document" | "video" | "link";
    name?: string;
  }
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
}

// Improved email sending with retry logic
async function sendEmailWithRetry(transporter: any, mailOptions: any, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          email: mailOptions.to
        };
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return { success: false, error: 'Max retries reached', email: mailOptions.to };
}

export async function POST(request: NextRequest) {
  try {
    const { newsId, title, content, doc_type, attachment } = (await request.json()) as RequestBody;

    if (!newsId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'News ID is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to MongoDB
    const client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db(process.env.MONGODB_DB);

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

    // Setup email transporter with connection pool
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    // Process emails in smaller batches
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (sub) => {
          try {
            return await sendEmailWithRetry(
              transporter,
              {
                from: `"AKY Media Center" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to: sub.email,
                subject: `New Update: ${title}`,
                html: generateEmailHtml({
                  title: news?.title || title,
                  content: news?.content || content,
                  attachment: news?.attachment || attachment,
                  _id: newsId,
                  doc_type: news?.doc_type || doc_type
                }, sub.name || 'Subscriber'),
                headers: {
                  'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}>`,
                },
              }
            );
          } catch (error) {
            return {
              success: false,
              email: sub.email,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      results.push(...batchResults);

      // Add small delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Store notification record
    const notification: Notification = {
      _id: new ObjectId(),
      title,
      content: typeof content === "string"
        ? content.substring(0, 200) + (content.length > 200 ? "..." : "")
        : "",
      doc_type,
      sentTo: successful.length,
      sentAt: new Date(),
      type: "news_notification",
      status: failed.length === 0 ? "sent" : "partial",
      emailSubject: `New Update: ${title}`,
      articleId: newsId ? new ObjectId(newsId) : null,
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
        failed: failed.length,
        notificationId: notification._id
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

// // Improved email template with better mobile support
// function generateEmailHtml(news: any, name: string) {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.com';
//   const newsUrl = `${baseUrl}/news/${news._id || ''}`;
//   const title = news.title || 'Latest Update';
//   const content = news.content || '';
//   const previewText = content.length > 200 ? `${content.substring(0, 200)}...` : content;
//   const category = news.doc_type || 'Update';
//   const imageUrl = news.attachment?.url || '';
//   const imageAlt = news.attachment?.name || title;

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//       <title>${title}</title>
//       <style>
//         @media only screen and (max-width: 600px) {
//           .container { width: 100% !important; padding: 10px !important; }
//           .content { padding: 15px !important; }
//           .button { display: block !important; width: 100% !important; }
//         }
//         body {
//           margin: 0;
//           padding: 0;
//           font-family: Arial, sans-serif;
//           background-color: #f4f4f4;
//           color: #333;
//           line-height: 1.6;
//         }
//         .header {
//           background: #dc2626;
//           padding: 20px;
//           text-align: center;
//           color: white;
//         }
//         .content {
//           padding: 20px;
//           background: white;
//         }
//         .footer {
//           padding: 20px;
//           text-align: center;
//           font-size: 12px;
//           color: #666;
//           background: #f8fafc;
//         }
//         .category {
//           display: inline-block;
//           background: #f59e0b;
//           color: white;
//           padding: 4px 12px;
//           border-radius: 12px;
//           font-size: 12px;
//           margin-bottom: 15px;
//           text-transform: capitalize;
//         }
//         .title {
//           color: #1f2937;
//           margin: 10px 0 15px;
//         }
//         .news-image {
//           max-width: 100%;
//           height: auto;
//           border-radius: 4px;
//           margin: 0 0 15px;
//           display: block;
//         }
//         .button {
//           display: inline-block;
//           padding: 12px 24px;
//           background: #dc2626;
//           color: white;
//           text-decoration: none;
//           border-radius: 4px;
//           font-weight: bold;
//           font-size: 16px;
//           margin: 25px 0;
//         }
//       </style>
//     </head>
//     <body>
//       <div style="max-width: 600px; margin: 0 auto;">
//         <!-- Header -->
//         <div class="header">
//           <h1 style="margin: 0;">AKY Media Center</h1>
//           <p style="margin: 5px 0 0;">Latest Update from Governor Abba Kabir Yusuf</p>
//         </div>

//         <!-- Content -->
//         <div class="content">
//           ${category ? `
//             <span class="category">${category}</span>
//           ` : ''}

//           <h2 class="title">${title}</h2>

//           ${imageUrl ? `
//             <img src="${imageUrl}" alt="${imageAlt}" class="news-image">
//           ` : ''}

//           <div style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
//             ${previewText}
//           </div>

//           <div style="text-align: center;">
//             <a href="${newsUrl}" class="button">
//               Read Full Story
//             </a>
//           </div>
//         </div>

//         <!-- Footer -->
//         <div class="footer">
//           <p style="margin: 0 0 10px;">${new Date().getFullYear()} AKY Media Center. All rights reserved.</p>
//           <p style="margin: 0;">
//             <a href="${baseUrl}/unsubscribe" style="color: #666; text-decoration: underline;">
//               Unsubscribe
//             </a>
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

// Enhanced email template with better content display
function generateEmailHtml(news: any, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.com';
  const newsUrl = `${baseUrl}/news/${news._id || ''}`;
  const title = news.title || 'Latest Update';
  const content = news.content || '';
  const category = news.doc_type || 'Update';
  const imageUrl = news.attachment?.url || '';
  const imageAlt = news.attachment?.name || title;

  // Improved content handling with proper HTML formatting
  const formattedContent = content
    .replace(/\n/g, '<br>') // Convert line breaks to HTML
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, '<a href="$1" style="color: #dc2626; text-decoration: underline;">$2</a>'); // Style links

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 15px !important; }
          .button { display: block !important; width: 100% !important; }
          .title { font-size: 22px !important; }
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          background: url(${baseUrl}/pictures/email-header.png  );
          background-size: cover;
          background-position: center;
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
          background: white;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          background: #f8fafc;
        }
        .category {
          display: inline-block;
          background: #f59e0b;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 15px;
          text-transform: capitalize;
          font-weight: bold;
        }
        .title {
          color: #1f2937;
          margin: 10px 0 20px;
          font-size: 26px;
          line-height: 1.3;
        }
        .greeting {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 20px;
        }
        .news-image-container {
          margin: 0 0 25px;
          text-align: center;
        }
        .news-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          display: block;
          margin: 0 auto;
        }
        .image-caption {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          text-align: center;
        }
        .content-text {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 25px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #dc2626;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background: #b91c1c;
        }
        .unsubscribe {
          color: #666;
          text-decoration: underline;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>AKY Media Center</h1>
          <p>Latest Update from Governor Abba Kabir Yusuf</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          ${category ? `<span class="category">${category}</span>` : ''}
          
          <h2 class="title">${title}</h2>
          
          <p class="greeting">Dear ${name || 'Subscriber'},</p>
          
          ${imageUrl ? `
            <div class="news-image-container">
              <img src="${imageUrl}" alt="${imageAlt}" class="news-image">
              ${imageAlt ? `<p class="image-caption">${imageAlt}</p>` : ''}
            </div>
          ` : ''}
          
          <div class="content-text">
            ${formattedContent}
          </div>
          
          <div class="button-container">
            <a href="${newsUrl}" class="button">
              Read Full Story
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} AKY Media Center. All rights reserved.</p>
          <p style="margin: 0;">
            <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(name)}" class="unsubscribe">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}
