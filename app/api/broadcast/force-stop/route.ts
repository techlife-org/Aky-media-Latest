import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    // Stop all active broadcasts
    await db.collection("broadcasts").updateMany(
      { isActive: true },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      message: "All broadcasts stopped successfully",
    })
  } catch (error) {
    console.error("Force stop broadcast error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
