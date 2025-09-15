import { type NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import jwt from "jsonwebtoken"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    const { token, secret, isSetup = false } = await request.json()

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: "Token is required" 
        },
        { status: 400 }
      )
    }

    // For login verification, use the stored secret from environment
    let secretToUse = secret
    if (!isSetup) {
      secretToUse = process.env.ADMIN_2FA_SECRET
      if (!secretToUse) {
        return NextResponse.json(
          { 
            success: false,
            message: "2FA is not configured. Please complete setup first." 
          },
          { status: 400 }
        )
      }
    }

    if (!secretToUse) {
      return NextResponse.json(
        { 
          success: false,
          message: "Secret is required" 
        },
        { status: 400 }
      )
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secretToUse,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    })

    if (!verified) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid authentication code" 
        },
        { status: 401 }
      )
    }

    // If this is setup verification, just return success
    if (isSetup) {
      return NextResponse.json({
        success: true,
        message: "2FA setup completed successfully"
      })
    }

    // For login verification, create a full auth token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { 
          success: false,
          message: "Server configuration error" 
        },
        { status: 500 }
      )
    }

    // Create JWT token with 2FA verified flag
    const authToken = jwt.sign(
      { 
        email: process.env.ADMIN_EMAIL, 
        role: "admin",
        twoFactorVerified: true
      }, 
      jwtSecret, 
      { expiresIn: "24h" }
    )

    const response = NextResponse.json({
      success: true,
      message: "2FA verification successful",
      user: { 
        email: process.env.ADMIN_EMAIL, 
        role: "admin",
        twoFactorEnabled: true
      }
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to verify 2FA code" 
      },
      { status: 500 }
    )
  }
}

export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))