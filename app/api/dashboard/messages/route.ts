import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error('Database connection error:', error);
      // Return a default response when database is not available
      return NextResponse.json({
        message: "Service temporarily unavailable. Please try again later.",
        success: false
      }, { status: 503 });
    }

    const messages = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Dashboard messages error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
