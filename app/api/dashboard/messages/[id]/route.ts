import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("contacts").deleteOne({
      _id: new ObjectId(params.id),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
