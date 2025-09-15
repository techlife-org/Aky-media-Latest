import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check credentials against environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
    }

    if (email === adminEmail && password === adminPassword) {
      // Create temporary token for 2FA step
      const tempToken = jwt.sign(
        { 
          email, 
          role: "admin", 
          step: "awaiting_2fa",
          timestamp: Date.now()
        }, 
        jwtSecret, 
        { expiresIn: "10m" } // Short expiry for 2FA step
      )

      const response = NextResponse.json({
        message: "Credentials verified. Please enter your 2FA code.",
        requiresTwoFactor: true,
        user: { email, role: "admin" },
        success: true,
      })

      // Set temporary cookie for 2FA step
      response.cookies.set("temp-auth-token", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))
