import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    // Verify broadcast admin authentication
    const token = request.cookies.get("broadcast-auth-token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required", success: false },
        { status: 401 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error", success: false },
        { status: 500 }
      )
    }

    let adminData
    try {
      adminData = jwt.verify(token, jwtSecret) as any
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid authentication token", success: false },
        { status: 401 }
      )
    }

    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.warn("Primary database connection failed, trying fallback:", error)
      
      if (process.env.NODE_ENV === "development") {
        try {
          const fallbackConnection = await connectToDatabaseWithFallback()
          db = fallbackConnection.db
          console.log("✅ Using fallback database for broadcast resume")
        } catch (fallbackError) {
          console.error("Both primary and fallback database connections failed:", fallbackError)
          return NextResponse.json(
            {
              message: "Service temporarily unavailable. Please try again later.",
              success: false,
              health: {
                server: false,
                database: false,
                streaming: false
              }
            },
            { status: 503 }
          )
        }
      } else {
        console.error("Database connection error:", error)
        return NextResponse.json(
          {
            message: "Service temporarily unavailable. Please try again later.",
            success: false,
            health: {
              server: false,
              database: false,
              streaming: false
            }
          },
          { status: 503 }
        )
      }
    }

    const { broadcastId } = await request.json()

    // Find and resume the broadcast
    const updateResult = await db.collection("broadcasts").updateOne(
      { 
        id: broadcastId || { $exists: true },
        adminId: adminData.id,
        isActive: true,
        isPaused: true
      },
      {
        $set: {
          isPaused: false,
          resumedAt: new Date(),
          lastActivity: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          pausedAt: ""
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { 
          message: "No paused broadcast found to resume",
          success: false
        },
        { status: 404 }
      )
    }

    // Get the updated broadcast
    const broadcast = await db.collection("broadcasts").findOne({
      adminId: adminData.id,
      isActive: true,
      isPaused: { $ne: true }
    })

    return NextResponse.json({
      message: "Broadcast resumed successfully",
      success: true,
      broadcast,
      timestamp: new Date().toISOString(),
      health: {
        server: true,
        database: true,
        streaming: true
      }
    })

  } catch (error) {
    console.error("Resume broadcast error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        health: {
          server: false,
          database: false,
          streaming: false
        }
      },
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))