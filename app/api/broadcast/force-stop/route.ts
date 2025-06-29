import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

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
