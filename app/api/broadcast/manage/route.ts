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
          console.log("✅ Using fallback database for broadcast management")
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

    const { action, broadcastId, data } = await request.json()

    let updateResult
    let message = ""
    let broadcast = null

    switch (action) {
      case "pause":
        updateResult = await db.collection("broadcasts").updateOne(
          { 
            id: broadcastId || { $exists: true },
            adminId: adminData.id,
            isActive: true,
            isPaused: { $ne: true }
          },
          {
            $set: {
              isPaused: true,
              pausedAt: new Date(),
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = "Broadcast paused successfully"
        break

      case "resume":
        updateResult = await db.collection("broadcasts").updateOne(
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
        message = "Broadcast resumed successfully"
        break

      case "update_settings":
        updateResult = await db.collection("broadcasts").updateOne(
          { 
            id: broadcastId || { $exists: true },
            adminId: adminData.id,
            isActive: true
          },
          {
            $set: {
              settings: { ...data.settings },
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = "Broadcast settings updated successfully"
        break

      case "update_title":
        updateResult = await db.collection("broadcasts").updateOne(
          { 
            id: broadcastId || { $exists: true },
            adminId: adminData.id,
            isActive: true
          },
          {
            $set: {
              title: data.title,
              description: data.description || "",
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = "Broadcast title updated successfully"
        break

      case "toggle_recording":
        const currentBroadcast = await db.collection("broadcasts").findOne({
          id: broadcastId || { $exists: true },
          adminId: adminData.id,
          isActive: true
        })
        
        if (!currentBroadcast) {
          return NextResponse.json(
            { message: "No active broadcast found", success: false },
            { status: 404 }
          )
        }

        updateResult = await db.collection("broadcasts").updateOne(
          { _id: currentBroadcast._id },
          {
            $set: {
              isRecording: !currentBroadcast.isRecording,
              recordingStartedAt: !currentBroadcast.isRecording ? new Date() : currentBroadcast.recordingStartedAt,
              recordingStoppedAt: currentBroadcast.isRecording ? new Date() : null,
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = `Recording ${!currentBroadcast.isRecording ? 'started' : 'stopped'} successfully`
        break

      case "add_participant":
        updateResult = await db.collection("broadcasts").updateOne(
          { 
            id: broadcastId || { $exists: true },
            adminId: adminData.id,
            isActive: true
          },
          {
            $push: {
              participants: {
                id: data.participant.id,
                name: data.participant.name,
                email: data.participant.email || "",
                isHost: false,
                isApproved: data.participant.isApproved || true,
                joinedAt: new Date(),
                userType: data.participant.userType || 'viewer',
                permissions: data.participant.permissions || {
                  canSpeak: false,
                  canVideo: false,
                  canScreenShare: false,
                  canChat: true,
                  canReact: true
                },
                connectionStatus: 'connected',
                mediaStatus: {
                  video: false,
                  audio: false,
                  screenShare: false
                }
              }
            },
            $set: {
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = "Participant added successfully"
        break

      case "remove_participant":
        updateResult = await db.collection("broadcasts").updateOne(
          { 
            id: broadcastId || { $exists: true },
            adminId: adminData.id,
            isActive: true
          },
          {
            $pull: {
              participants: { id: data.participantId }
            },
            $set: {
              lastActivity: new Date(),
              updatedAt: new Date()
            }
          }
        )
        message = "Participant removed successfully"
        break

      default:
        return NextResponse.json(
          { message: "Invalid action", success: false },
          { status: 400 }
        )
    }

    if (updateResult && updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { 
          message: "No broadcast found or no changes made",
          success: false
        },
        { status: 404 }
      )
    }

    // Get the updated broadcast
    broadcast = await db.collection("broadcasts").findOne({
      adminId: adminData.id,
      isActive: true
    })

    return NextResponse.json({
      message,
      success: true,
      broadcast,
      action,
      timestamp: new Date().toISOString(),
      health: {
        server: true,
        database: true,
        streaming: true
      }
    })

  } catch (error) {
    console.error("Manage broadcast error:", error)
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