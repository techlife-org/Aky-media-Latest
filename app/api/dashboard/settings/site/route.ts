import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    const { db } = await connectToDatabase()

    // Update or insert site settings
    await db.collection("site_settings").updateOne(
      { type: "site" },
      {
        $set: {
          ...settings,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json(
      {
        success: true,
        message: "Site settings updated successfully",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}
