import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("contacts").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
