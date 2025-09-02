import { type NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"
import type { BroadcastAdmin } from "@/models/BroadcastAdmin"

async function handler(request: NextRequest) {
  try {
    const { email, password, name, role = 'broadcast_admin' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required", success: false },
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
          console.log("✅ Using fallback database for registration")
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

    // Check if admin already exists
    const existingAdmin = await db.collection("broadcastAdmins").findOne({ 
      email: email.toLowerCase() 
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists", success: false },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcryptjs.hash(password, saltRounds)

    // Create new broadcast admin
    const newAdmin: BroadcastAdmin = {
      id: Math.random().toString(36).substring(2, 15),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role as 'broadcast_admin' | 'super_admin',
      permissions: {
        canCreateBroadcast: true,
        canManageBroadcast: true,
        canViewAnalytics: role === 'super_admin',
        canManageParticipants: true,
        canAccessChat: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        title: "Broadcast Administrator",
        department: "Media Center"
      },
      broadcastSettings: {
        defaultTitle: "Governor's Live Address",
        autoRecord: false,
        maxParticipants: 1000,
        allowScreenShare: true,
        allowChat: true,
        allowReactions: true
      }
    }

    // Insert into database
    const result = await db.collection("broadcastAdmins").insertOne(newAdmin)

    if (!result.insertedId) {
      throw new Error("Failed to create admin")
    }

    return NextResponse.json({
      message: "Broadcast admin created successfully",
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        profile: newAdmin.profile,
        broadcastSettings: newAdmin.broadcastSettings
      },
    })
  } catch (error) {
    console.error("Broadcast admin registration error:", error)
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