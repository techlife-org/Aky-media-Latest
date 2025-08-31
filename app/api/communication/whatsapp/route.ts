import { NextRequest, NextResponse } from 'next/server'

interface WhatsAppMessage {
  to: string | string[]
  message: string
  type?: 'text' | 'image' | 'document' | 'template'
  media_url?: string
  media_caption?: string
  template_name?: string
  template_language?: string
  template_parameters?: string[]
}

// Termii WhatsApp API Configuration
const TERMII_BASE_URL = 'https://api.ng.termii.com/api'
const TERMII_API_KEY = process.env.TERMII_API_KEY
const TERMII_WHATSAPP_SENDER_ID = process.env.TERMII_WHATSAPP_SENDER_ID || process.env.TERMII_WHATSAPP_FROM

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppMessage = await request.json()
    const { 
      to, 
      message, 
      type = 'text', 
      media_url, 
      media_caption,
      template_name,
      template_language = 'en',
      template_parameters = []
    } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number(s) required' },
        { status: 400 }
      )
    }

    if (!message && !media_url && !template_name) {
      return NextResponse.json(
        { success: false, error: 'Message content, media URL, or template name is required' },
        { status: 400 }
      )
    }

    if (!TERMII_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Termii WhatsApp API not configured',
          details: 'Please add TERMII_API_KEY to your environment variables',
          setup: {
            provider: 'Termii - Nigerian WhatsApp Provider',
            step1: 'Sign up at https://termii.com/',
            step2: 'Complete business verification and KYC',
            step3: 'Get your API key from dashboard',
            step4: 'Add TERMII_API_KEY to .env file',
            step5: 'Set TERMII_WHATSAPP_SENDER_ID for custom sender name',
            pricing: 'Competitive rates for Nigerian market',
            features: [
              'WhatsApp messaging for Nigeria',
              'High delivery rates',
              'Text messaging support',
              'Bulk WhatsApp campaigns',
              'Local Nigerian support',
              'Cost-effective pricing',
              'Easy integration'
            ]
          }
        },
        { status: 500 }
      )
    }

    // Determine if this is a bulk WhatsApp message
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
      
      // If phone starts with 234 (Nigeria), add +
      if (cleanPhone.startsWith('234')) {
        return '+' + cleanPhone
      }
      
      // If phone starts with 0 (local Nigerian format), replace with +234
      if (cleanPhone.startsWith('0')) {
        return '+234' + cleanPhone.substring(1)
      }
      
      // If phone doesn't start with country code, assume Nigeria and add +234
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        const localNumber = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone
        return '+234' + localNumber
      }
      
      // For other formats, ensure it starts with +
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone
      }
      
      return cleanPhone
    }

    const formattedRecipients = recipients.map(formatPhoneNumber)

    // Validate formatted phone numbers
    const validatePhoneNumber = (phone: string): boolean => {
      const phoneRegex = /^\+\d{10,15}$/
      return phoneRegex.test(phone)
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

    // Send WhatsApp messages via Termii API
    const results = []
    
    // Termii WhatsApp API supports text messages primarily
    // For now, we'll focus on text messaging which is the most common use case
    if (type !== 'text' && type !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Termii WhatsApp currently supports text messages only',
          details: 'Media and template messages are not yet supported via Termii WhatsApp API',
          supportedTypes: ['text']
        },
        { status: 400 }
      )
    }
    
    for (const recipient of formattedRecipients) {
      try {
        const messagePayload = {
          to: recipient,
          sms: message,
          type: 'plain',
          api_key: TERMII_API_KEY,
          channel: 'whatsapp'
        }
        
        // Add sender ID - use configured or default
        messagePayload.from = TERMII_WHATSAPP_SENDER_ID || 'Termii'

        const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload)
        })

        const result = await response.json()
        
        console.log('Termii WhatsApp Response:', {
          recipient,
          status: response.status,
          ok: response.ok,
          result
        })
        
        results.push({
          recipient: recipient,
          success: response.ok && (result.message_id || result.message === 'Successfully Sent'),
          data: result,
          messageId: result.message_id || `termii_wa_${Date.now()}`,
          status: result.message_id ? 'sent' : 'failed',
          balance: result.balance
        })

      } catch (error: any) {
        console.error('WhatsApp sending error for', recipient, ':', error)
        results.push({
          recipient: recipient,
          success: false,
          error: error.message
        })
      }
    }

    // Check overall success
    const successCount = results.filter(r => r.success).length
    const isOverallSuccess = successCount === results.length

    if (isOverallSuccess) {
      console.log('WhatsApp messages sent successfully via Termii:', {
        recipients: formattedRecipients.length,
        type: isBulk ? 'bulk' : 'single',
        messageType: type || 'text',
        successCount: successCount
      })

      return NextResponse.json({
        success: true,
        data: {
          originalRecipients: recipients,
          formattedRecipients: formattedRecipients,
          type: isBulk ? 'bulk' : 'single',
          messageType: type || 'text',
          sentAt: new Date().toISOString(),
          successCount: successCount,
          totalCount: results.length,
          results: results,
          provider: 'Termii WhatsApp API'
        },
        message: `WhatsApp message sent successfully to ${successCount}/${results.length} recipient(s)`
      })
    } else {
      console.error('Some WhatsApp messages failed via Termii:', results)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send WhatsApp message to ${results.length - successCount} recipient(s)`,
          details: results,
          provider: 'Termii WhatsApp API'
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('WhatsApp sending error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send WhatsApp message',
        details: error.message,
        provider: 'Termii WhatsApp API'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check WhatsApp service status
export async function GET() {
  try {
    if (!TERMII_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Termii WhatsApp API not configured',
          billing: {
            provider: 'Termii WhatsApp API',
            signupUrl: 'https://termii.com/',
            pricingUrl: 'https://termii.com/pricing',
            documentation: 'https://developers.termii.com/',
            features: [
              'WhatsApp messaging for Nigerian market',
              'High delivery rates',
              'Text messaging support',
              'Bulk WhatsApp campaigns',
              'Local Nigerian support',
              'Cost-effective pricing',
              'Easy integration',
              'Same API as SMS service',
              'Unified billing system'
            ],
            pricing: {
              whatsapp: {
                price: 'Competitive rates for Nigerian market',
                currency: 'NGN',
                note: 'Pricing varies by volume and destination'
              },
              setup: {
                price: 'Free setup',
                note: 'No setup fees, pay per message'
              }
            },
            setup: {
              step1: 'Sign up at termii.com',
              step2: 'Complete business verification and KYC',
              step3: 'Get API key from dashboard',
              step4: 'Add TERMII_API_KEY to environment variables',
              step5: 'Set TERMII_WHATSAPP_SENDER_ID for custom sender'
            }
          }
        },
        { status: 500 }
      )
    }

    // Check WhatsApp service status via Termii balance check
    try {
      const response = await fetch(`${TERMII_BASE_URL}/get-balance?api_key=${TERMII_API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (response.ok && result.balance !== undefined) {
        const balance = parseFloat(result.balance) || 0
        const currency = result.currency || 'NGN'
        
        return NextResponse.json({
          success: true,
          service: 'WhatsApp (Termii)',
          status: 'active',
          account: {
            balance: balance,
            currency: currency,
            senderId: TERMII_WHATSAPP_SENDER_ID,
            apiStatus: 'connected',
            lastChecked: new Date().toISOString()
          },
          billing: {
            provider: 'Termii WhatsApp API',
            dashboardUrl: 'https://accounts.termii.com/',
            pricingUrl: 'https://termii.com/pricing',
            supportUrl: 'https://termii.com/contact',
            documentationUrl: 'https://developers.termii.com/',
            features: [
              'WhatsApp messaging for Nigerian market',
              'High delivery rates',
              'Text messaging support',
              'Bulk WhatsApp campaigns',
              'Local Nigerian support',
              'Cost-effective pricing',
              'Easy integration',
              'Same API as SMS service',
              'Unified billing system'
            ],
            pricing: {
              whatsapp: {
                price: 'Competitive rates for Nigerian market',
                currency: 'NGN',
                note: 'WhatsApp messaging rates vary by volume'
              },
              unified: {
                note: 'Same balance used for SMS and WhatsApp'
              }
            },
            paymentMethods: [
              'Bank Transfer',
              'Card Payment',
              'USSD',
              'Bank Deposit',
              'Online Banking'
            ]
          },
          capabilities: {
            textMessages: true,
            mediaMessages: false, // Not yet supported via Termii
            templateMessages: false, // Not yet supported via Termii
            bulkMessaging: true,
            twoWayMessaging: false, // Limited support
            webhookSupport: false, // Limited support
            deliveryReports: true,
            readReceipts: false
          },
          message: `WhatsApp service is active. Balance: ₦${balance}`
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            service: 'WhatsApp (Termii)',
            status: 'error',
            error: result.message || 'Failed to check API status',
            billing: {
              provider: 'Termii WhatsApp API',
              signupUrl: 'https://termii.com/',
              loginUrl: 'https://accounts.termii.com/',
              supportUrl: 'https://termii.com/contact',
              troubleshooting: [
                'Check if API key is valid',
                'Ensure account is active and verified',
                'Verify account has sufficient balance',
                'Check account status in Termii dashboard',
                'Contact Termii support if issues persist'
              ]
            }
          },
          { status: response.status }
        )
      }

    } catch (apiError: any) {
      console.error('Termii WhatsApp API error:', apiError)
      
      return NextResponse.json(
        {
          success: false,
          service: 'WhatsApp (Termii)',
          status: 'error',
          error: 'Failed to connect to Termii WhatsApp API',
          details: apiError.message,
          billing: {
            provider: 'Termii WhatsApp API',
            signupUrl: 'https://termii.com/',
            pricingUrl: 'https://termii.com/pricing',
            documentationUrl: 'https://developers.termii.com/',
            supportUrl: 'https://termii.com/contact',
            quickStart: [
              '1. Sign up at termii.com',
              '2. Complete business verification and KYC',
              '3. Get API key from dashboard',
              '4. Add TERMII_API_KEY to environment variables',
              '5. Set TERMII_WHATSAPP_SENDER_ID for custom sender'
            ]
          }
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('WhatsApp service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'WhatsApp (Termii)',
        status: 'error',
        error: error.message,
        billing: {
          provider: 'Termii WhatsApp API',
          signupUrl: 'https://termii.com/',
          pricingUrl: 'https://termii.com/pricing',
          documentationUrl: 'https://developers.termii.com/',
          supportUrl: 'https://termii.com/contact'
        }
      },
      { status: 500 }
    )
  }
}