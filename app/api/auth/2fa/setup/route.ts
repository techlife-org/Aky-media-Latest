import { type NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import { withCors } from "@/lib/cors"

async function handler(request: NextRequest) {
  try {
    // Generate a secret for the user
    const secret = speakeasy.generateSecret({
      name: `AKY Admin Dashboard (${process.env.ADMIN_EMAIL})`,
      issuer: 'AKY Media Center',
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      setupInstructions: {
        step1: "Install Google Authenticator app on your phone",
        step2: "Scan the QR code or manually enter the key",
        step3: "Enter the 6-digit code from your app to verify setup"
      }
    })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to setup 2FA" 
      },
      { status: 500 }
    )
  }
}

export const GET = withCors(handler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }))