import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, mobile, subject, message } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ message: "All required fields must be filled" }, { status: 400 })
    }

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
      return NextResponse.json({ message: "Service temporarily unavailable" }, { status: 503 })
    }

    const contactMessage = {
      firstName,
      lastName,
      email,
      mobile: mobile || "",
      subject,
      message,
      status: "new",
      priority: "medium",
      category: "general",
      createdAt: new Date(),
      readAt: null,
      confirmationEmailSent: false,
      confirmationSMSSent: false,
      confirmationWhatsAppSent: false,
      adminNotificationSent: false,
      metadata: {
        ip: request.headers.get("x-forwarded-for") || request.ip,
        userAgent: request.headers.get("user-agent"),
      }
    }

    const result = await db.collection("contacts").insertOne(contactMessage)

    if (result.insertedId) {
      try {
        await addToSubscribers(db, {
          firstName,
          lastName,
          email,
          mobile: mobile || "",
          source: "contact_form"
        })
      } catch (subscriberError) {
        console.error("Failed to add subscriber:", subscriberError)
      }

      const notificationMessage = mobile 
        ? "Thank you for your message! We will get back to you within 30 minutes during business hours. Please check your email, SMS, and WhatsApp for confirmation. You have also been added to our subscriber list."
        : "Thank you for your message! We will get back to you within 30 minutes during business hours. Please check your email for confirmation. You have also been added to our subscriber list."

      return NextResponse.json({
        success: true,
        message: notificationMessage,
        contactId: result.insertedId.toString(),
        subscriberAdded: true
      })
    } else {
      throw new Error("Failed to save message")
    }
  } catch (error: any) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { message: "Sorry, there was an error sending your message. Please try again." },
      { status: 500 }
    )
  }
}

async function addToSubscribers(db: any, contactData: any) {
  const subscriber = {
    firstName: contactData.firstName,
    lastName: contactData.lastName,
    email: contactData.email,
    mobile: contactData.mobile || "",
    source: contactData.source || "contact_form",
    status: "active",
    subscribedAt: new Date(),
    preferences: {
      email: true,
      sms: !!contactData.mobile,
      whatsapp: !!contactData.mobile,
      newsletter: true,
      updates: true,
      promotions: false
    },
    tags: ["contact_form_subscriber"],
    metadata: {
      subscriptionMethod: "contact_form"
    }
  }

  const existingSubscriber = await db.collection("subscribers").findOne({ email: contactData.email })
  
  if (existingSubscriber) {
    await db.collection("subscribers").updateOne(
      { email: contactData.email },
      { 
        $set: {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          mobile: contactData.mobile || existingSubscriber.mobile,
          lastUpdated: new Date(),
          status: "active"
        },
        $addToSet: {
          tags: "contact_form_subscriber"
        }
      }
    )
  } else {
    await db.collection("subscribers").insertOne(subscriber)
  }
}