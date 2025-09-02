import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback, initializeFallbackAdmin } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"
import type { BroadcastAdmin } from "@/models/BroadcastAdmin"

async function handler(request: NextRequest) {
  try {
    const token = request.cookies.get("broadcast-auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "No authentication token found", success: false, authenticated: false },
        { status: 401 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error", success: false, authenticated: false },
        { status: 500 }
      )
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any

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
            // Ensure admin exists in fallback database
            await initializeFallbackAdmin()
            console.log("✅ Using fallback database for verification")
          } catch (fallbackError: any) {
            console.error("Both primary and fallback database connections failed:", fallbackError.message)
            return NextResponse.json(
              { message: "Database connection failed", success: false, authenticated: false },
              { status: 503 }
            )
          }
        } else {
          return NextResponse.json(
            { message: "Database connection failed", success: false, authenticated: false },
            { status: 503 }
          )
        }
      }
      
      const admin = await db.collection<BroadcastAdmin>("broadcastAdmins").findOne({ 
        id: decoded.id,
        isActive: true 
      })

      if (!admin) {
        return NextResponse.json(
          { message: "Admin not found or inactive", success: false, authenticated: false },
          { status: 401 }
        )
      }

      return NextResponse.json({
        message: "Authentication verified",
        success: true,
        authenticated: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          profile: admin.profile,
          broadcastSettings: admin.broadcastSettings,
          lastLogin: admin.lastLogin
        },
      })
    } catch (jwtError) {
      return NextResponse.json(
        { message: "Invalid or expired token", success: false, authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Broadcast admin verification error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false,
        authenticated: false
      },
      { status: 500 }
    )
  }
}

export const GET = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))