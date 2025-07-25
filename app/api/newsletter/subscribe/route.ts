import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb';
import { withCors } from "@/lib/cors"
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Define validation schema
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  source: z.string().default('website')
});

// Email template
const getWelcomeEmail = (email: string, name?: string) => ({
  from: `"${process.env.EMAIL_FROM_NAME || 'AKY Media'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
  to: email,
  subject: 'Welcome to AKY Newsletter!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 20px; text-align: center; color: white;">
        <h1>Welcome to AKY Media</h1>
      </div>
      <div style="padding: 20px; background: white;">
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for subscribing to our newsletter. You'll now receive the latest updates, news, and announcements directly to your inbox.</p>
        <p>We're excited to have you with us!</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
            display: inline-block; 
            padding: 12px 24px; 
            background: #dc2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px;
            font-weight: bold;
          ">
            Visit Our Website
          </a>
        </div>
        
        <p>If you didn't subscribe to our newsletter, please ignore this email or contact our support team.</p>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p> ${new Date().getFullYear()} AKY Media. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #666; text-decoration: underline;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  text: `Welcome to AKY Newsletter!
  
  Hello ${name || 'there'},
  
  Thank you for subscribing to our newsletter. You'll now receive the latest updates, news, and announcements directly to your inbox.
  
  If you didn't subscribe to our newsletter, please ignore this email or contact our support team.
  
   ${new Date().getFullYear()} AKY Media. All rights reserved.
  
  Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}
  `
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
    const validation = subscribeSchema.safeParse(body);
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

    const { email, name, source } = validation.data;

    // Connect to MongoDB
    let client;
    try {
      client = await new MongoClient(process.env.MONGODB_URI!).connect();
      const db = client.db(process.env.MONGODB_DB);

      // Check if email already exists
      const existingSubscriber = await db.collection("subscribers").findOne({ 
        email: { $regex: `^${email}$`, $options: 'i' } // Case-insensitive match
      });

      if (existingSubscriber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'This email is already subscribed to our newsletter!',
            email: email
          }, 
          { status: 400 }
        );
      }

      // Add new subscriber
      const result = await db.collection("subscribers").insertOne({
        email,
        name: name || null,
        subscribedAt: new Date(),
        status: "pending", // Start as pending until email is verified if needed
        source: source || 'website',
        lastActive: new Date(),
        emailVerified: false,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.ip,
          userAgent: request.headers.get('user-agent'),
        }
      });

      // Send welcome email in the background
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          // Add better error handling for email sending
          pool: true,
          maxConnections: 1,
          maxMessages: 5,
        });

        await transporter.sendMail(getWelcomeEmail(email, name));

        // Update subscriber status to active after sending welcome email
        await db.collection("subscribers").updateOne(
          { _id: result.insertedId },
          { $set: { status: 'active', welcomeEmailSent: true, welcomeEmailSentAt: new Date() } }
        );

      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Log the error but don't fail the request
        await db.collection("email_errors").insertOne({
          type: 'welcome_email',
          email,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          timestamp: new Date()
        });
      }

      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing! Please check your email for confirmation.",
        data: { email, name, id: result.insertedId }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to process subscription. Please try again later.',
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
