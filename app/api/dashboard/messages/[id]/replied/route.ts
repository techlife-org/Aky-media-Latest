import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    const result = await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "replied",
          updatedAt: new Date(),
          repliedAt: new Date(),
        },
      },
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
