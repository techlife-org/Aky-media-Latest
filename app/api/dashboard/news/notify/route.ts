import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const { title, content, doc_type } = await request.json()
    const { db } = await connectToDatabase()

    // Get all active subscribers
    const subscribers = await db
      .collection("subscribers")
      .find({
        status: { $ne: "unsubscribed" },
      })
      .toArray()

    if (subscribers.length === 0) {
      return NextResponse.json(
        {
          message: "No active subscribers found",
          sentTo: 0,
        },
        { headers: corsHeaders },
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
            
            <div style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              ${content.length > 300 ? content.substring(0, 300) + "..." : content}
            </div>
            
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

    // Store notification record
    const notification = {
      title,
      content: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      doc_type,
      sentTo: subscribers.length,
      sentAt: new Date(),
      type: "news_notification",
      status: "sent",
      emailSubject: emailContent.subject,
      subscribers: subscribers.map((sub) => ({
        email: sub.email,
        name: sub.name || "Subscriber",
      })),
    }

    await db.collection("email_notifications").insertOne(notification)

    // Update subscriber engagement
    await db.collection("subscribers").updateMany(
      { _id: { $in: subscribers.map((s) => s._id) } },
      {
        $set: { lastEmailSent: new Date() },
        $inc: { emailsReceived: 1 },
      },
    )

    return NextResponse.json(
      {
        success: true,
        message: "News update sent successfully to all subscribers",
        sentTo: subscribers.length,
        notificationId: notification._id,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("News notification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send news update",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}
