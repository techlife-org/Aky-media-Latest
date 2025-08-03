import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid message ID format" }, { status: 400 })
    }

    // Update message status to spam
    const result = await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "spam",
          updatedAt: new Date(),
          spamMarkedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message marked as spam successfully",
    })
  } catch (error) {
    console.error("Error marking message as spam:", error)
    return NextResponse.json({ error: "Failed to mark message as spam" }, { status: 500 })
  }
}
