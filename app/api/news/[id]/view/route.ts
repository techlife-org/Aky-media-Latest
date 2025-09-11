import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[News View API] Starting view increment for ID:", (await params).id)
    const { id } = await params

    // Validate the ID parameter
    if (!id || !ObjectId.isValid(id)) {
      console.log("[News View API] Invalid ID provided:", id)
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    console.log("[News View API] Attempting database connection...")

    const dbConnection = await connectToDatabase()
    const db = dbConnection.db
    console.log("[News View API] Database connected successfully")

    console.log("[News View API] Updating view count for news with ID:", id)

    // Increment the view count for the news article
    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    )

    console.log("[News View API] Database update result:", result)

    // If no news article was updated, return 404
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 })
    }

    console.log("[News View API] View count incremented successfully")
    return NextResponse.json({ success: true, message: "View count incremented" })
  } catch (error) {
    console.error("[News View API] Error in view increment API route:", error)
    return NextResponse.json(
      {
        error: "Failed to increment view count",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}