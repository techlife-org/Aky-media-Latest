import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb';
import { withCors } from "@/lib/cors"
import { NotificationService } from '@/lib/notification-service';
import { validateAndFormatPhone } from '@/lib/phone-utils';
import { z } from 'zod';

// Define validation schema
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  name: z.string().optional(),
  source: z.string().default('website')
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

    let { email, phone, name, source } = validation.data;

    // Validate and format phone number if provided
    let formattedPhone = null;
    if (phone && phone.trim()) {
      const phoneValidation = validateAndFormatPhone(phone.trim());
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: phoneValidation.error || 'Please enter a valid phone number'
          },
          { status: 400 }
        );
      }
      formattedPhone = phoneValidation.formattedPhone;
    }

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
        phone: formattedPhone,
        name: name || null,
        subscribedAt: new Date(),
        status: "active", // Start as active
        source: source || 'website',
        lastActive: new Date(),
        emailVerified: false,
        phoneVerified: false,
        welcomeEmailSent: false,
        welcomeSMSSent: false,
        welcomeWhatsAppSent: false,
        preferences: {
          emailNotifications: true,
          smsNotifications: !!formattedPhone,
          whatsappNotifications: !!formattedPhone
        },
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.ip,
          userAgent: request.headers.get('user-agent'),
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Send welcome notifications in the background
      try {
        const notificationService = new NotificationService();
        const notificationResults = await notificationService.sendWelcomeNotifications(email, formattedPhone, name);

        // Update subscriber with notification status
        const updateData: any = {
          updatedAt: new Date()
        };

        if (notificationResults.email) {
          updateData.welcomeEmailSent = true;
          updateData.welcomeEmailSentAt = new Date();
        }

        if (notificationResults.sms) {
          updateData.welcomeSMSSent = true;
          updateData.welcomeSMSSentAt = new Date();
        }

        if (notificationResults.whatsapp) {
          updateData.welcomeWhatsAppSent = true;
          updateData.welcomeWhatsAppSentAt = new Date();
        }

        await db.collection("subscribers").updateOne(
          { _id: result.insertedId },
          { $set: updateData }
        );

        // Log any notification errors
        if (notificationResults.errors.length > 0) {
          await db.collection("notification_errors").insertOne({
            type: 'welcome_notifications',
            subscriberId: result.insertedId,
            email,
            phone: formattedPhone,
            errors: notificationResults.errors,
            timestamp: new Date()
          });
        }

      } catch (notificationError) {
        console.error('Failed to send welcome notifications:', notificationError);
        // Log the error but don't fail the request
        await db.collection("notification_errors").insertOne({
          type: 'welcome_notifications',
          subscriberId: result.insertedId,
          email,
          phone: formattedPhone,
          error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
          timestamp: new Date()
        });
      }

      const message = formattedPhone 
        ? "Thank you for subscribing! Please check your email, SMS, and WhatsApp for confirmation."
        : "Thank you for subscribing! Please check your email for confirmation.";

      return NextResponse.json({
        success: true,
        message,
        data: { email, phone: formattedPhone, name, id: result.insertedId }
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
