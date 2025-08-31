import { NextRequest, NextResponse } from 'next/server'
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type = 'subscribers', // 'subscribers', 'contact-us', 'news', or 'achievements'
      email, 
      phone, 
      name = 'Test User',
      firstName = 'Test',
      lastName = 'User',
      subject = 'Test Subject',
      // News specific fields
      newsTitle = 'Test News Article',
      newsContent = 'This is a test news article content.',
      newsCategory = 'General',
      newsUrl = 'http://localhost:3000/news/test',
      newsImage = '',
      // Achievement specific fields
      achievementTitle = 'Test Achievement',
      achievementDescription = 'This is a test achievement description.',
      achievementCategory = 'Infrastructure',
      achievementProgress = 75,
      achievementLocation = 'Test Location',
      achievementDate = new Date().toLocaleDateString(),
      achievementUrl = 'http://localhost:3000/achievements/test',
      achievementImage = ''
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
    } else if (type === 'news') {
      results = await notificationService.sendNewsNotifications({
        email,
        phone,
        name,
        newsTitle,
        newsContent,
        newsCategory,
        newsUrl,
        newsImage
      })
    } else if (type === 'achievements') {
      results = await notificationService.sendAchievementNotifications({
        email,
        phone,
        name,
        achievementTitle,
        achievementDescription,
        achievementCategory,
        achievementProgress,
        achievementLocation,
        achievementDate,
        achievementUrl,
        achievementImage
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "subscribers", "contact-us", "news", or "achievements"' },
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
        type: 'subscribers | contact-us | news | achievements',
        email: 'test@example.com (optional)',
        phone: '+1234567890 (optional)',
        name: 'Test User (for subscribers, news, achievements)',
        firstName: 'Test (for contact-us)',
        lastName: 'User (for contact-us)',
        subject: 'Test Subject (for contact-us)',
        newsTitle: 'News Title (for news)',
        newsContent: 'News Content (for news)',
        newsCategory: 'News Category (for news)',
        newsUrl: 'News URL (for news)',
        achievementTitle: 'Achievement Title (for achievements)',
        achievementDescription: 'Achievement Description (for achievements)',
        achievementCategory: 'Achievement Category (for achievements)',
        achievementProgress: 'Progress Percentage (for achievements)',
        achievementLocation: 'Location (for achievements)',
        achievementDate: 'Date (for achievements)'
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
      },
      newsTest: {
        type: 'news',
        email: 'test@example.com',
        phone: '+2348161781643',
        name: 'John Doe',
        newsTitle: 'Breaking News: Digital Innovation',
        newsContent: 'We are excited to announce new digital initiatives...',
        newsCategory: 'Technology',
        newsUrl: 'http://localhost:3000/news/123'
      },
      achievementTest: {
        type: 'achievements',
        email: 'test@example.com',
        phone: '+2348161781643',
        name: 'John Doe',
        achievementTitle: 'New Infrastructure Project Completed',
        achievementDescription: 'Successfully completed the digital infrastructure upgrade...',
        achievementCategory: 'Infrastructure',
        achievementProgress: 100,
        achievementLocation: 'Kano State',
        achievementDate: '2025-01-01'
      }
    }
  })
}