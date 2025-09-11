import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback, initializeFallbackAdmin } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"
import type { BroadcastAdmin } from "@/models/BroadcastAdmin"

async function handler(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      )
    }

    // Connect to database with fallback support
    let db
    try {
      const connection = await connectToDatabase()
      db = connection.db
    } catch (dbError: any) {
      console.warn("Primary database connection failed, trying fallback:", dbError.message)
      
      if (process.env.NODE_ENV === "development") {
        try {
          const fallbackConnection = await connectToDatabaseWithFallback()
          db = fallbackConnection.db
          // Initialize default admin in fallback database
          await initializeFallbackAdmin()
          console.log("✅ Using fallback database for development")
        } catch (fallbackError: any) {
          console.error("Both primary and fallback database connections failed:", fallbackError.message)
          return NextResponse.json(
            { 
              message: "Database connection failed. Please try again later.", 
              success: false,
              error: process.env.NODE_ENV === "development" ? `Primary: ${dbError.message}, Fallback: ${fallbackError.message}` : undefined
            },
            { status: 503 }
          )
        }
      } else {
        return NextResponse.json(
          { 
            message: "Database connection failed. Please try again later.", 
            success: false,
            error: process.env.NODE_ENV === "development" ? dbError.message : undefined
          },
          { status: 503 }
        )
      }
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error", success: false },
        { status: 500 }
      )
    }

    // Find broadcast admin by email
    const admin = await db.collection<BroadcastAdmin>("broadcastAdmins").findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      )
    }

    // Update last login
    await db.collection("broadcastAdmins").updateOne(
      { _id: admin._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    )

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      jwtSecret,
      { expiresIn: "24h" }
    )

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        profile: admin.profile,
        broadcastSettings: admin.broadcastSettings
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("broadcast-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Broadcast admin login error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false,
        error: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))