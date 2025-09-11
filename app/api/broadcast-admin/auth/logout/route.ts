import { type NextRequest, NextResponse } from "next/server"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    })

    // Clear the broadcast auth cookie
    response.cookies.set("broadcast-auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Broadcast admin logout error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false
      },
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))