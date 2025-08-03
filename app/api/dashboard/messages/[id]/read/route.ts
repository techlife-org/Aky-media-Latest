import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid message ID format" 
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // First check if the message exists
    const messageExists = await db.collection("contacts").findOne({ _id: new ObjectId(id) })
    
    if (!messageExists) {
      return NextResponse.json({ 
        success: false,
        error: "Message not found" 
      }, { status: 404 })
    }

    // Update message status to read in the contacts collection
    await db.collection("contacts").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "read",
          updatedAt: new Date(),
          readAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Message marked as read successfully",
    })
  } catch (error) {
    console.error("Error marking message as read:", error)
    return NextResponse.json(
      { error: "Failed to mark message as read" }, 
      { status: 500 }
    )
  }
}
