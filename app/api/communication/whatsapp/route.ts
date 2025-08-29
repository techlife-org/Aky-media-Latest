import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

interface WhatsAppMessage {
  to: string
  message?: string
  templateSid?: string
  templateVariables?: string
  from?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppMessage = await request.json()
    const { to, message, templateSid, templateVariables, from } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number is required' },
        { status: 400 }
      )
    }

    if (!message && !templateSid) {
      return NextResponse.json(
        { success: false, error: 'Either message or templateSid is required' },
        { status: 400 }
      )
    }

    // Validate Twilio credentials
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { success: false, error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    // Format phone number for WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    const whatsappFrom = from || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

    let messageOptions: any = {
      from: whatsappFrom,
      to: formattedTo
    }

    // Use template message if templateSid is provided
    if (templateSid) {
      messageOptions.contentSid = templateSid
      if (templateVariables) {
        messageOptions.contentVariables = templateVariables
      }
    } else {
      // Use simple text message
      messageOptions.body = message
    }

    // Send WhatsApp message
    const twilioMessage = await client.messages.create(messageOptions)

    console.log('WhatsApp message sent successfully:', {
      sid: twilioMessage.sid,
      to: formattedTo,
      status: twilioMessage.status
    })

    return NextResponse.json({
      success: true,
      data: {
        messageSid: twilioMessage.sid,
        status: twilioMessage.status,
        to: formattedTo,
        from: whatsappFrom,
        sentAt: new Date().toISOString()
      },
      message: 'WhatsApp message sent successfully'
    })

  } catch (error: any) {
    console.error('WhatsApp sending error:', error)

    // Handle Twilio specific errors
    if (error.code) {
      return NextResponse.json(
        {
          success: false,
          error: `Twilio Error ${error.code}: ${error.message}`,
          details: error.moreInfo || null
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send WhatsApp message',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check WhatsApp service status
export async function GET() {
  try {
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { success: false, error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    // Test Twilio connection by fetching account info
    const account = await client.api.accounts(accountSid).fetch()

    return NextResponse.json({
      success: true,
      service: 'WhatsApp (Twilio)',
      status: 'active',
      accountSid: account.sid,
      accountStatus: account.status,
      message: 'WhatsApp service is ready'
    })

  } catch (error: any) {
    console.error('WhatsApp service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'WhatsApp (Twilio)',
        status: 'error',
        error: error.message
      },
      { status: 500 }
    )
  }
}