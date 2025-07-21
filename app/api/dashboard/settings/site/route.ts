import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error('Database connection error:', error);
      // Return a default response when database is not available
      return NextResponse.json({
        message: "Service temporarily unavailable. Please try again later.",
        success: false
      }, { status: 503 });
    }

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
