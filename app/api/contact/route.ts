import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

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
      return NextResponse.json({
        success: true,
        message: "Thank you for your message! We'll get back to you within 30 minutes during business hours.",
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
