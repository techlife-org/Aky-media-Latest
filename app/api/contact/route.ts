import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, mobile, subject, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ message: "All required fields must be filled" }, { status: 400 })
    }

    // Validate email format
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

    // Save contact message to database
    const contactMessage = {
      firstName,
      lastName,
      email,
      mobile: mobile || "",
      subject,
      message,
      status: "new",
      createdAt: new Date(),
      readAt: null,
    }

    const result = await db.collection("contacts").insertOne(contactMessage)

    if (result.insertedId) {
      // Send contact notifications in the background
      try {
        const notificationService = new EnhancedNotificationService();
        const notificationResults = await notificationService.sendContactNotifications({
          email,
          mobile,
          firstName,
          lastName,
          subject
        });

        // Update contact message with notification status
        const updateData: any = {
          updatedAt: new Date()
        };

        if (notificationResults.email?.success) {
          updateData.confirmationEmailSent = true;
          updateData.confirmationEmailSentAt = new Date();
        }

        if (notificationResults.sms?.success) {
          updateData.confirmationSMSSent = true;
          updateData.confirmationSMSSentAt = new Date();
        }

        if (notificationResults.whatsapp?.success) {
          updateData.confirmationWhatsAppSent = true;
          updateData.confirmationWhatsAppSentAt = new Date();
        }

        await db.collection("contacts").updateOne(
          { _id: result.insertedId },
          { $set: updateData }
        );

        // Log any notification errors
        if (notificationResults.errors.length > 0) {
          await db.collection("notification_errors").insertOne({
            type: 'contact_notifications',
            contactId: result.insertedId,
            email,
            mobile,
            errors: notificationResults.errors,
            timestamp: new Date()
          });
        }

      } catch (notificationError) {
        console.error('Failed to send contact notifications:', notificationError);
        // Log the error but don't fail the request
        await db.collection("notification_errors").insertOne({
          type: 'contact_notifications',
          contactId: result.insertedId,
          email,
          mobile,
          error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
          timestamp: new Date()
        });
      }

      const notificationMessage = mobile 
        ? "Thank you for your message! We'll get back to you within 30 minutes during business hours. Please check your email, SMS, and WhatsApp for confirmation."
        : "Thank you for your message! We'll get back to you within 30 minutes during business hours. Please check your email for confirmation.";

      return NextResponse.json({
        success: true,
        message: notificationMessage,
      })
    } else {
      throw new Error("Failed to save message")
    }
  } catch (error: any) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { message: "Sorry, there was an error sending your message. Please try again." },
      { status: 500 },
    )
  }
}
