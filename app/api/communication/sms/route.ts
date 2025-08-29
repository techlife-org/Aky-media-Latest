import { NextRequest, NextResponse } from 'next/server'
import { https } from 'follow-redirects'

interface SMSMessage {
  to: string | string[]
  message: string
  from?: string
}

const INFOBIP_BASE_URL = 'api.infobip.com'
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY
const INFOBIP_FROM = process.env.INFOBIP_FROM || '447491163443'

export async function POST(request: NextRequest) {
  try {
    const body: SMSMessage = await request.json()
    const { to, message, from } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number(s) required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!INFOBIP_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Infobip API key not configured' },
        { status: 500 }
      )
    }

    // Determine if this is a bulk SMS (array of recipients)
    const isBulk = Array.isArray(to)
    const recipients = isBulk ? to : [to]

    // Format phone numbers to ensure they have proper international format
    const formatPhoneNumber = (phone: string): string => {
      // Remove any spaces, dashes, or other non-numeric characters except +
      let cleanPhone = phone.replace(/[^+\d]/g, '')
      
      // If phone starts with +, keep it as is
      if (cleanPhone.startsWith('+')) {
        return cleanPhone
      }
      
      // If phone starts with 234 (Nigeria), add + prefix
      if (cleanPhone.startsWith('234')) {
        return '+' + cleanPhone
      }
      
      // If phone starts with 0 (local Nigerian format), replace with +234
      if (cleanPhone.startsWith('0')) {
        return '+234' + cleanPhone.substring(1)
      }
      
      // If phone doesn't start with country code, assume Nigeria and add +234
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        // Remove leading 0 if present and add +234
        const localNumber = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone
        return '+234' + localNumber
      }
      
      // For other formats, add + if not present
      return cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone
    }

    const formattedRecipients = recipients.map(formatPhoneNumber)

    // Validate formatted phone numbers
    const validatePhoneNumber = (phone: string): boolean => {
      // Check if phone number is in valid international format
      const phoneRegex = /^\+[1-9]\d{1,14}$/
      return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 16
    }

    const invalidNumbers = formattedRecipients.filter(phone => !validatePhoneNumber(phone))
    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format',
          details: `Invalid numbers: ${invalidNumbers.join(', ')}. Use international format like +2348161781643`
        },
        { status: 400 }
      )
    }

    // Prepare SMS data for Infobip
    const smsData = {
      messages: [
        {
          destinations: formattedRecipients.map(phone => ({ to: phone })),
          from: from || INFOBIP_FROM,
          text: message
        }
      ]
    }

    // Send SMS via Infobip API using follow-redirects https module
    const result = await new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        hostname: INFOBIP_BASE_URL,
        path: '/sms/2/text/advanced',
        headers: {
          'Authorization': `App ${INFOBIP_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        maxRedirects: 20
      }

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = []

        res.on('data', (chunk) => {
          chunks.push(chunk)
        })

        res.on('end', () => {
          const body = Buffer.concat(chunks)
          try {
            const responseData = JSON.parse(body.toString())
            resolve(responseData)
          } catch (error) {
            reject(new Error('Invalid JSON response'))
          }
        })

        res.on('error', (error) => {
          reject(error)
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(JSON.stringify(smsData))
      req.end()
    })

    const responseData = result as any

    // Check if the response indicates success
    if (responseData.messages && responseData.messages.length > 0) {
      const firstMessage = responseData.messages[0]
      
      console.log('SMS sent successfully:', {
        messageId: firstMessage.messageId,
        recipients: formattedRecipients.length,
        type: isBulk ? 'bulk' : 'single',
        status: firstMessage.status
      })

      return NextResponse.json({
        success: true,
        data: {
          messageId: firstMessage.messageId,
          originalRecipients: recipients,
          formattedRecipients: formattedRecipients,
          type: isBulk ? 'bulk' : 'single',
          sentAt: new Date().toISOString(),
          status: firstMessage.status,
          response: responseData
        },
        message: `SMS sent successfully to ${formattedRecipients.length} recipient(s)`
      })
    } else {
      console.error('Infobip API error:', responseData)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send SMS',
          details: responseData.requestError?.serviceException?.text || 'Unknown error'
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('SMS sending error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send SMS',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check SMS service status
export async function GET() {
  try {
    if (!INFOBIP_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Infobip API key not configured' },
        { status: 500 }
      )
    }

    // Check account balance via Infobip API
    const result = await new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: INFOBIP_BASE_URL,
        path: '/account/1/balance',
        headers: {
          'Authorization': `App ${INFOBIP_API_KEY}`,
          'Accept': 'application/json'
        },
        maxRedirects: 20
      }

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = []

        res.on('data', (chunk) => {
          chunks.push(chunk)
        })

        res.on('end', () => {
          const body = Buffer.concat(chunks)
          try {
            const responseData = JSON.parse(body.toString())
            resolve({ status: res.statusCode, data: responseData })
          } catch (error) {
            reject(new Error('Invalid JSON response'))
          }
        })

        res.on('error', (error) => {
          reject(error)
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.end()
    })

    const response = result as any

    if (response.status === 200) {
      return NextResponse.json({
        success: true,
        service: 'SMS (Infobip)',
        status: 'active',
        balance: response.data.balance,
        currency: response.data.currency,
        message: 'SMS service is ready'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          service: 'SMS (Infobip)',
          status: 'error',
          error: response.data.requestError?.serviceException?.text || 'Failed to check balance'
        },
        { status: response.status }
      )
    }

  } catch (error: any) {
    console.error('SMS service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'SMS (Infobip)',
        status: 'error',
        error: error.message
      },
      { status: 500 }
    )
  }
}