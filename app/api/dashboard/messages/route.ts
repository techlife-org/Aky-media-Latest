import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const messages = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Dashboard messages error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
