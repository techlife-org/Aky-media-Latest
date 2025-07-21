import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { corsHeaders } from "@/lib/cors"

interface Attachment {
  url: string
  type: "image" | "document" | "video" | "link"
  name?: string
}

interface RequestBody {
  id?: string
  title: string
  content: string
  doc_type: string
  attachment?: Attachment
}

interface Subscriber {
  _id: ObjectId
  email: string
  name?: string
  status: string
  mobile?: string // Added mobile field
  lastEmailSent?: Date
  emailsReceived?: number
}

interface Notification {
  _id: ObjectId
  title: string
  content: string
  doc_type: string
  sentTo: number
  sentAt: Date
  type: "news_notification"
  status: "sent"
  emailSubject: string
  articleId?: ObjectId | null;
  subscribers: { email: string; name: string; mobile?: string }[] // Added mobile to notification subscribers
  attachment?: Attachment
}

export async function POST(request: NextRequest) {
  try {
    const { id, title, content, doc_type, attachment } = (await request.json()) as RequestBody
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      // Return a default response when database is not available
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    // Get all active subscribers with proper type assertion, including mobile numbers
    const subscribers = await db
      .collection<Subscriber>("subscribers")
      .find(
        {
          status: { $in: ["active", "pending"] },
          email: { $exists: true, $ne: "" },
        } as any,
        { projection: { email: 1, name: 1, mobile: 1 } }, // Project only necessary fields
      )
      .toArray()

    if (subscribers.length === 0) {
      return NextResponse.json(
        {
          message: "No active subscribers found",
          sentTo: 0,
        },
        { headers: corsHeaders() }, // Use corsHeaders() as a function call
      )
    }

    // Create email content
    const emailContent = {
      subject: `New Update: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AKY Media Center</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">News Update from Governor Abba Kabir Yusuf</p>
          </div>
          <div style="padding: 30px; background: white;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <span style="background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${doc_type}</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">${title}</h2>
            <div style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">${
              content.length > 300 ? content.substring(0, 300) + "..." : content
            }</div>
            ${
              attachment
                ? `
            <div style="margin: 30px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #dc2626; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">Attachment:</h3>
              ${
                attachment.type === "image"
                  ? `<img src="${attachment.url}" alt="${
                      attachment.name || "News attachment"
                    }" style="max-width: 100%; border-radius: 4px; margin-bottom: 10px;" />`
                  : ""
              }
              <a href="${attachment.url}"
                  target="_blank"
                  style="color: #dc2626; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                ${attachment.name || "Download Attachment"}
              </a>
            </div>`
                : ""
            }
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"}/news"
                  style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Read Full Article
              </a>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              You're receiving this because you subscribed to AKY Media Center updates.
            </p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"}/unsubscribe"
                style="color: #dc2626; text-decoration: none; font-size: 12px;">
              Unsubscribe
            </a>
          </div>
        </div>
      `,
      text: `
        AKY Media Center - News Update
        ${title}
        Category: ${doc_type}
        ${content}
        ${attachment ? `Attachment: ${attachment.name || "Download"} - ${attachment.url}` : ""}
        Read more at: ${process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"}/news
        ---
        You're receiving this because you subscribed to AKY Media Center updates.
        Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"}/unsubscribe
      `,
    }

    // In a real application, integrate with email service (SendGrid, Mailgun, etc.)
    // For now, we'll simulate and log the email sending
    console.log("📧 Sending news update to subscribers:", {
      title,
      doc_type,
      subscriberCount: subscribers.length,
      emailContent: emailContent.subject,
    })

    // Simulate sending emails
    for (const subscriber of subscribers) {
      console.log(`Simulating email to: ${subscriber.email} with subject: ${emailContent.subject}`)
      // Here you would call your email service API (e.g., SendGrid, Nodemailer)
      // Example: await sendEmail(subscriber.email, emailContent.subject, emailContent.html, emailContent.text);

      // Simulate SMS sending if mobile number is available
      if (subscriber.mobile) {
        console.log(`Simulating SMS to: ${subscriber.mobile} with message: New update: ${title.substring(0, 50)}...`)
        // Here you would call your SMS service API (e.g., Twilio, Vonage)
        // Example: await sendSms(subscriber.mobile, `New update: ${title.substring(0, 100)}...`);
      }
    }

    // Store notification record
    const notification: Notification = {
      _id: new ObjectId(),
      title,
      content: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      doc_type,
      sentTo: subscribers.length,
      sentAt: new Date(),
      type: "news_notification",
      status: "sent",
      emailSubject: emailContent.subject,
      articleId: id ? new ObjectId(id) : null,
      subscribers: subscribers.map((sub) => ({
        email: sub.email,
        name: sub.name || "Subscriber",
        ...(sub.mobile && { mobile: sub.mobile }), // Include mobile if present
      })),
      ...(attachment ? { attachment } : {}),
    }

    await db.collection("email_notifications").insertOne({
      ...notification,
      _id: notification._id,
      articleId: notification.articleId,
    })

    // Update subscriber engagement with proper type assertion
    if (subscribers.length > 0) {
      await db.collection<Subscriber>("subscribers").updateMany(
        {
          _id: { $in: subscribers.map((sub) => sub._id) },
        } as any,
        { $inc: { emailsReceived: 1 }, $set: { lastEmailSent: new Date() } } as any,
      )
    }

    // Insert notification into database
    await db.collection("notifications").insertOne(notification)

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "News update sent successfully to all subscribers",
        sentTo: subscribers.length,
        notificationId: notification._id.toString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  } catch (error: any) {
    console.error("News notification error:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to send news update",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
