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
      // Create JWT token
      const token = jwt.sign({ email, role: "admin" }, jwtSecret, { expiresIn: "24h" })

      const response = NextResponse.json({
        message: "Login successful",
        user: { email, role: "admin" },
        success: true,
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400, // 24 hours
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
