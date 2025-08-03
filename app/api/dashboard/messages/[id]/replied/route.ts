import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
// import { id } from "date-fns/locale"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params
    
    console.log('Attempting to update message with ID:', id);
    
    if (!ObjectId.isValid(id)) {
      console.error('Invalid ObjectId format:', id);
      return NextResponse.json({ error: "Invalid message ID format" }, { status: 400 });
    }
    
    const objectId = new ObjectId(id);
    console.log('Converted to ObjectId:', objectId);
    
    // Check if the message exists in the 'contacts' collection
    const message = await db.collection("contacts").findOne({ _id: objectId });
    
    if (!message) {
      return NextResponse.json({ 
        error: "Message not found in 'contacts' collection",
        objectId: objectId.toString(),
        stringId: id
      }, { status: 404 });
    }
    
    const result = await db.collection("contacts").updateOne(
      { _id: objectId },
      {
        $set: {
          status: "replied",
          updatedAt: new Date(),
          repliedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking message as replied:", error)
    return NextResponse.json({ error: "Failed to update message status" }, { status: 500 })
  }
}
