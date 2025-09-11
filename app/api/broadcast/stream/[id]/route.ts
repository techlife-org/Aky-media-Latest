import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabaseWithFallback } from "@/lib/mongodb-fallback"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id

    // Check if broadcast exists and is active
    let db
    try {
      const fallbackConnection = await connectToDatabaseWithFallback()
      db = fallbackConnection.db
    } catch (error) {
      console.error("Database connection failed:", error)
      return NextResponse.json(
        { 
          message: "Service temporarily unavailable", 
          success: false,
          error: "database_connection_failed",
          retryAfter: 5000
        },
        { status: 503 }
      )
    }

    const broadcast = await db.collection("broadcasts").findOne({
      $or: [
        { id: broadcastId, isActive: true },
        { _id: broadcastId, isActive: true }
      ]
    })

    if (!broadcast) {
      console.log(`Stream endpoint: No active broadcast found for ID: ${broadcastId}`)
      return NextResponse.json(
        { 
          message: "Broadcast not found or inactive", 
          success: false,
          error: "broadcast_not_found",
          broadcastId
        },
        { status: 404 }
      )
    }
    
    console.log(`Stream endpoint: Found active broadcast: ${broadcast.title}`)

    // Get the request host for proper URL generation
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

    // Calculate stream health and quality
    const uptime = broadcast.startedAt ? Math.floor((Date.now() - new Date(broadcast.startedAt).getTime()) / 1000) : 0
    const streamHealth = uptime > 300 ? 'excellent' : uptime > 60 ? 'good' : 'initializing'
    
    // For WebRTC streaming, provide signaling server information
    const streamOptions = {
      webrtc: {
        signalingServer: `${baseUrl}/api/broadcast/stream/${broadcastId}/webrtc/signaling`,
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ],
        protocol: "WebRTC",
        quality: "HD",
        bitrate: "2000kbps",
        resolution: "1280x720"
      },
      hls: {
        url: `${baseUrl}/api/broadcast/stream/${broadcastId}/hls`,
        protocol: "HLS",
        quality: "HD",
        bitrate: "2000kbps",
        resolution: "1280x720"
      },
      demo: {
        url: `${baseUrl}/api/broadcast/stream/${broadcastId}/demo`,
        protocol: "Demo",
        quality: "HD",
        bitrate: "1500kbps",
        resolution: "1280x720"
      }
    }

    return NextResponse.json({
      message: "Stream endpoint active",
      success: true,
      broadcastId,
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        startedAt: broadcast.startedAt,
        uptime: uptime
      },
      streaming: {
        isLive: true,
        health: streamHealth,
        options: streamOptions,
        recommended: streamOptions.webrtc, // Use WebRTC for real-time streaming
        streamUrl: streamOptions.webrtc.signalingServer, // Primary stream URL
        fallbackUrl: streamOptions.hls.url
      },
      metadata: {
        viewerCount: broadcast.participants?.length || 0,
        chatEnabled: true,
        recordingEnabled: broadcast.recordingEnabled || false,
        quality: "HD",
        latency: "low"
      }
    })

  } catch (error) {
    console.error("Stream endpoint error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error", 
        success: false,
        error: "internal_server_error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Handle WebRTC signaling
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id
    const { action, data } = await request.json()

    if (action === 'health_check') {
      return NextResponse.json({
        success: true,
        broadcastId,
        health: 'excellent',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'offer') {
      // Handle WebRTC offer from broadcaster
      return NextResponse.json({
        success: true,
        broadcastId,
        action: 'answer',
        // In a real implementation, this would be the actual WebRTC answer
        answer: {
          type: 'answer',
          sdp: 'SIMULATED_ANSWER_SDP'
        }
      })
    }

    if (action === 'candidate') {
      // Handle ICE candidate
      return NextResponse.json({
        success: true,
        broadcastId,
        action: 'candidate',
        candidate: {
          // In a real implementation, this would be the actual ICE candidate
          candidate: 'SIMULATED_ICE_CANDIDATE'
        }
      })
    }

    return NextResponse.json(
      { message: "Action not supported", success: false },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    )
  }
}