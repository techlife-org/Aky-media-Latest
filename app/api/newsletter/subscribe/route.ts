import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { withCors } from "@/lib/cors"
import nodemailer from 'nodemailer';

async function handler(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

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

    // Check if email already exists
    const existingSubscriber = await db.collection("subscribers").findOne({ email })
    if (existingSubscriber) {
      return NextResponse.json({ message: "You are already subscribed to our newsletter!" }, { status: 400 })
    }

    // Add new subscriber
    await db.collection("subscribers").insertOne({
      email,
      subscribedAt: new Date(),
      status: "active",
      source: "Newsletter",
    })

    // Send welcome email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'AKY Newsletter'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
        to: email,
        subject: 'Welcome to AKY Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to AKY Newsletter!</h2>
            <p>Dear Subscriber,</p>
            <p>Thank you for subscribing to our newsletter. You'll now receive regular updates from us.</p>
            <p>If you didn't subscribe, please ignore this email or contact our support team.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              ${new Date().getFullYear()} AKY. All rights reserved.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email sending fails, but log it
    }

    return NextResponse.json({
      message: "Thank you for subscribing! You'll receive our latest updates.",
      success: true,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { 
        message: "Something went wrong. Please try again later.",
        success: false
      }, 
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))
