import { NextRequest, NextResponse } from 'next/server'

const TERMII_BASE_URL = 'https://api.ng.termii.com/api'
const TERMII_API_KEY = process.env.TERMII_API_KEY

export async function GET() {
  try {
    if (!TERMII_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Termii API key not configured' },
        { status: 500 }
      )
    }

    // Get account balance
    const balanceResponse = await fetch(`${TERMII_BASE_URL}/get-balance?api_key=${TERMII_API_KEY}`)
    const balanceData = await balanceResponse.json()

    // Try to get sender IDs (this endpoint might exist)
    let senderIds = null
    try {
      const senderResponse = await fetch(`${TERMII_BASE_URL}/sender-id?api_key=${TERMII_API_KEY}`)
      if (senderResponse.ok) {
        senderIds = await senderResponse.json()
      }
    } catch (error) {
      console.log('Sender ID endpoint not available or failed')
    }

    // Try to get application info
    let appInfo = null
    try {
      const appResponse = await fetch(`${TERMII_BASE_URL}/application?api_key=${TERMII_API_KEY}`)
      if (appResponse.ok) {
        appInfo = await appResponse.json()
      }
    } catch (error) {
      console.log('Application endpoint not available or failed')
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: balanceData,
        senderIds: senderIds,
        applicationInfo: appInfo,
        apiKey: TERMII_API_KEY ? `${TERMII_API_KEY.substring(0, 10)}...` : 'Not configured'
      },
      recommendations: {
        smsIssue: 'SMS requires registered sender ID. Contact Termii support to register a sender ID.',
        whatsappIssue: 'WhatsApp also requires registered sender ID for business messaging.',
        solution: 'Register sender IDs like "AKY Media", "AKYMEDIA", or "AKY" with Termii support.',
        contact: 'Email: support@termii.com or visit https://termii.com/contact'
      }
    })

  } catch (error) {
    console.error('Termii info error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get Termii information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}