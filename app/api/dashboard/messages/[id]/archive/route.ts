import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    // Validate the ID format first
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid message ID format" },
        { status: 400 }
      )
    }

    // First, check if the message exists
    const message = await db.collection("contact_messages").findOne({
      _id: new ObjectId(id),
    })

    if (!message) {
      console.error(`Message with ID ${id} not found`)
      return NextResponse.json(
        { error: `Message with ID ${id} not found` },
        { status: 404 }
      )
    }

    // If message exists, proceed with update
    const result = await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "archived",
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      console.error(`Failed to update message with ID ${id}`)
      return NextResponse.json(
        { error: "Failed to archive message" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Message archived successfully"
    })
  } catch (error) {
    console.error("Error in archive route:", error)
    return NextResponse.json(
      { 
        error: "Failed to archive message",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
