import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
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
          console.log("✅ Using fallback database for broadcast stop")
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
            { status: 503 },
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
          { status: 503 },
        )
      }
    }

    // Get the request body (might include specific broadcast ID)
    let broadcastId = null
    try {
      const body = await request.json()
      broadcastId = body.broadcastId
    } catch (e) {
      // No body provided, that's fine
    }

    // Find and stop active broadcast(s)
    let updateResult
    if (broadcastId) {
      // Stop specific broadcast
      updateResult = await db.collection("broadcasts").updateOne(
        { id: broadcastId, isActive: true },
        {
          $set: {
            isActive: false,
            endedAt: new Date(),
            lastActivity: new Date(),
          },
        },
      )
    } else {
      // Stop all active broadcasts
      updateResult = await db.collection("broadcasts").updateMany(
        { isActive: true },
        {
          $set: {
            isActive: false,
            endedAt: new Date(),
            lastActivity: new Date(),
          },
        },
      )
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        message: "No active broadcast found to stop",
        success: false,
        stoppedCount: 0,
        health: {
          server: true,
          database: true,
          streaming: true
        }
      }, { status: 404 })
    }

    return NextResponse.json({
      message: "Broadcast stopped successfully",
      stoppedCount: updateResult.modifiedCount,
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        server: true,
        database: true,
        streaming: true
      }
    })
  } catch (error: any) {
    console.error("Stop broadcast error:", error)
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error.message,
      success: false,
      health: {
        server: false,
        database: false,
        streaming: false
      }
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}