import { NextRequest, NextResponse } from 'next/server'
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type = 'subscribers', // 'subscribers' or 'contact-us'
      email, 
      phone, 
      name = 'Test User',
      firstName = 'Test',
      lastName = 'User',
      subject = 'Test Subject'
    } = body

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Either email or phone is required for testing' },
        { status: 400 }
      )
    }

    const notificationService = new EnhancedNotificationService()
    let results

    if (type === 'subscribers') {
      results = await notificationService.sendSubscriberNotifications({
        email,
        phone,
        name
      })
    } else if (type === 'contact-us') {
      results = await notificationService.sendContactNotifications({
        email,
        phone,
        firstName,
        lastName,
        subject
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "subscribers" or "contact-us"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifications sent',
      data: {
        type,
        results,
        summary: {
          emailSent: !!results.email?.success,
          smsSent: !!results.sms?.success,
          whatsappSent: !!results.whatsapp?.success,
          totalErrors: results.errors.length
        }
      }
    })

  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Template testing endpoint',
    usage: {
      method: 'POST',
      body: {
        type: 'subscribers | contact-us',
        email: 'test@example.com (optional)',
        phone: '+1234567890 (optional)',
        name: 'Test User (for subscribers)',
        firstName: 'Test (for contact-us)',
        lastName: 'User (for contact-us)',
        subject: 'Test Subject (for contact-us)'
      },
      note: 'Either email or phone must be provided'
    },
    examples: {
      subscriberTest: {
        type: 'subscribers',
        email: 'test@example.com',
        phone: '+2348161781643',
        name: 'John Doe'
      },
      contactTest: {
        type: 'contact-us',
        email: 'test@example.com',
        phone: '+2348161781643',
        firstName: 'John',
        lastName: 'Doe',
        subject: 'Test Contact Message'
      }
    }
  })
}