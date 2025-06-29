import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { withCors } from "@/lib/cors"

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

    const { db } = await connectToDatabase()

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

    return NextResponse.json({
      message: "Thank you for subscribing! You'll receive our latest updates.",
      success: true,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ message: "Something went wrong. Please try again later." }, { status: 500 })
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))
