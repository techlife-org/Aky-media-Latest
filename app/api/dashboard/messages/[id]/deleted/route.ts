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

    // Update message status to deleted (soft delete)
    const result = await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "deleted",
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message moved to deleted folder successfully",
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

// Permanent delete route
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid message ID format" }, { status: 400 })
    }

    // Permanently delete the message
    const result = await db.collection("contact_messages").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message permanently deleted successfully",
    })
  } catch (error) {
    console.error("Error permanently deleting message:", error)
    return NextResponse.json({ error: "Failed to permanently delete message" }, { status: 500 })
  }
}
