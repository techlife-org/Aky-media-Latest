import { NextRequest, NextResponse } from 'next/server'

interface SMSMessage {
  to: string | string[]
  message: string
  from?: string
}

// Termii SMS API Configuration
const TERMII_BASE_URL = 'https://api.ng.termii.com/api'
const TERMII_API_KEY = process.env.TERMII_API_KEY
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || process.env.TERMII_FROM

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

    if (!TERMII_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Termii API key not configured',
          details: 'Please add TERMII_API_KEY to your environment variables',
          setup: {
            provider: 'Termii - Nigerian SMS Provider',
            step1: 'Sign up at https://termii.com/',
            step2: 'Verify your account and complete KYC',
            step3: 'Get your API key from the dashboard',
            step4: 'Add TERMII_API_KEY to .env file',
            step5: 'Set TERMII_SENDER_ID for custom sender name',
            pricing: 'Competitive rates for Nigeria and global',
            features: [
              'SMS delivery to Nigeria and globally',
              'High delivery rates',
              'Real-time delivery reports',
              'Bulk SMS support',
              'OTP and verification services',
              'Voice messaging',
              'WhatsApp messaging',
              'Local Nigerian support'
            ]
          }
        },
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

    // Prepare SMS payload for Termii
    const smsPayload = {
      to: formattedRecipients.join(','), // Termii supports comma-separated recipients
      sms: message,
      type: 'plain',
      api_key: TERMII_API_KEY,
      channel: 'generic'
    }
    
    // Add sender ID - use provided, configured, or default
    smsPayload.from = from || TERMII_SENDER_ID || 'Termii'

    // Send SMS via Termii API
    try {
      const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsPayload)
      })

      const result = await response.json()
      
      console.log('Termii SMS Response:', {
        status: response.status,
        ok: response.ok,
        result
      })

      if (response.ok && (result.message_id || result.message === 'Successfully Sent')) {
        const successCount = formattedRecipients.length

        const results = formattedRecipients.map((recipient, index) => ({
          recipient: recipient,
          success: true,
          messageId: result.message_id || `termii_${Date.now()}_${index}`,
          status: 'sent',
          description: 'Message sent successfully via Termii'
        }))

        console.log('SMS sent successfully via Termii:', {
          recipients: formattedRecipients.length,
          type: isBulk ? 'bulk' : 'single',
          successCount: successCount
        })

        return NextResponse.json({
          success: true,
          data: {
            originalRecipients: recipients,
            formattedRecipients: formattedRecipients,
            type: isBulk ? 'bulk' : 'single',
            sentAt: new Date().toISOString(),
            successCount: successCount,
            totalCount: results.length,
            results: results,
            provider: 'Termii SMS API',
            messageId: result.message_id,
            balance: result.balance
          },
          message: `SMS sent successfully to ${successCount}/${results.length} recipient(s)`
        })
      } else {
        console.error('SMS failed via Termii:', result)
        return NextResponse.json(
          {
            success: false,
            error: result.message || 'Failed to send SMS',
            details: result,
            provider: 'Termii SMS API'
          },
          { status: response.status || 400 }
        )
      }

    } catch (apiError: any) {
      console.error('Termii SMS API error:', apiError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Termii SMS API',
          details: apiError.message,
          provider: 'Termii SMS API'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('SMS sending error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send SMS',
        details: error.message,
        provider: 'Termii SMS API'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check SMS service status with billing information
export async function GET() {
  try {
    if (!TERMII_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Termii API key not configured',
          billing: {
            provider: 'Termii SMS API',
            signupUrl: 'https://termii.com/',
            pricingUrl: 'https://termii.com/pricing',
            documentation: 'https://developers.termii.com/',
            features: [
              'SMS delivery to Nigeria and globally',
              'High delivery rates',
              'Real-time delivery reports',
              'Bulk SMS campaigns',
              'OTP and verification services',
              'Voice messaging',
              'WhatsApp messaging',
              'Email verification',
              'Local Nigerian support',
              'Competitive pricing'
            ],
            pricing: {
              nigeria: {
                price: 'Competitive rates for Nigerian networks',
                currency: 'NGN/USD',
                note: 'Volume discounts available'
              },
              global: {
                price: 'Global SMS delivery available',
                currency: 'USD',
                note: 'Rates vary by destination country'
              }
            },
            setup: {
              step1: 'Sign up at termii.com',
              step2: 'Complete KYC verification',
              step3: 'Add funds to your account',
              step4: 'Get API key from dashboard',
              step5: 'Configure sender ID'
            }
          }
        },
        { status: 500 }
      )
    }

    // Check account balance via Termii API
    try {
      const response = await fetch(`${TERMII_BASE_URL}/get-balance?api_key=${TERMII_API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok && result.balance !== undefined) {
        const balance = parseFloat(result.balance) || 0
        const currency = result.currency || 'NGN'
        
        // Calculate estimated SMS count based on average price (₦15 per SMS)
        const estimatedSmsCount = Math.floor(balance / 15)
        
        return NextResponse.json({
          success: true,
          service: 'SMS (Termii)',
          status: 'active',
          account: {
            balance: balance,
            currency: currency,
            estimatedSmsCount: estimatedSmsCount,
            lowBalanceWarning: balance < 1000, // ₦1000 threshold
            lastChecked: new Date().toISOString()
          },
          billing: {
            provider: 'Termii SMS API',
            topUpUrl: 'https://accounts.termii.com/billing',
            pricingUrl: 'https://termii.com/pricing',
            supportUrl: 'https://termii.com/contact',
            dashboardUrl: 'https://accounts.termii.com',
            features: [
              'SMS delivery to Nigeria and globally',
              'High delivery rates',
              'Real-time delivery reports',
              'Bulk SMS campaigns',
              'OTP and verification services',
              'Voice messaging',
              'WhatsApp messaging',
              'Email verification',
              'Local Nigerian support',
              'Competitive pricing'
            ],
            pricing: {
              nigeria: {
                price: '₦10 - ₦20 per SMS',
                currency: 'NGN',
                note: 'Volume discounts available. Rates vary by network.'
              },
              global: {
                price: 'Competitive global rates',
                currency: 'USD',
                note: 'International SMS delivery available'
              },
              recommendations: {
                starter: {
                  amount: '₦5,000',
                  smsCount: '~250-500 SMS',
                  suitable: 'Small businesses, testing'
                },
                business: {
                  amount: '₦20,000',
                  smsCount: '~1,000-2,000 SMS',
                  suitable: 'Medium businesses, campaigns'
                },
                enterprise: {
                  amount: '₦50,000+',
                  smsCount: '~2,500+ SMS',
                  suitable: 'Large organizations, bulk campaigns'
                }
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
            unicodeMessages: true,
            longMessages: true,
            bulkMessaging: true,
            scheduledMessages: false,
            twoWayMessaging: true,
            deliveryReports: true,
            numberLookup: false,
            senderIdSupport: true,
            otpServices: true,
            voiceMessaging: true,
            whatsappMessaging: true
          },
          message: `SMS service is ready. Balance: ₦${balance} (~${estimatedSmsCount} SMS)`
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            service: 'SMS (Termii)',
            status: 'error',
            error: result.message || 'Failed to check balance',
            billing: {
              provider: 'Termii SMS API',
              signupUrl: 'https://termii.com/',
              loginUrl: 'https://accounts.termii.com',
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
      console.error('Termii API error:', apiError)
      
      return NextResponse.json(
        {
          success: false,
          service: 'SMS (Termii)',
          status: 'error',
          error: 'Failed to connect to Termii API',
          details: apiError.message,
          billing: {
            provider: 'Termii SMS API',
            signupUrl: 'https://termii.com/',
            pricingUrl: 'https://termii.com/pricing',
            documentationUrl: 'https://developers.termii.com/',
            supportUrl: 'https://termii.com/contact',
            quickStart: [
              '1. Sign up at termii.com',
              '2. Complete KYC verification',
              '3. Add funds using bank transfer or card',
              '4. Get your API key from the dashboard',
              '5. Add TERMII_API_KEY to environment variables',
              '6. Set TERMII_SENDER_ID for custom sender name'
            ]
          }
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('SMS service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'SMS (Termii)',
        status: 'error',
        error: error.message,
        billing: {
          provider: 'Termii SMS API',
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