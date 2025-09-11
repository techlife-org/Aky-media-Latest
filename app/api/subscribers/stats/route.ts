import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Get total subscribers
    const totalSubscribers = await db.collection('subscribers').countDocuments()
    
    // Get active subscribers
    const activeSubscribers = await db.collection('subscribers').countDocuments({ status: 'active' })
    
    // Get subscribers by source
    const subscribersBySource = await db.collection('subscribers').aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray()
    
    // Get recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentSubscribers = await db.collection('subscribers').countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    })
    
    // Get subscribers with mobile numbers
    const subscribersWithMobile = await db.collection('subscribers').countDocuments({
      mobile: { $ne: '' }
    })
    
    // Get subscribers by preferences
    const emailSubscribers = await db.collection('subscribers').countDocuments({
      'preferences.email': true
    })
    
    const smsSubscribers = await db.collection('subscribers').countDocuments({
      'preferences.sms': true
    })
    
    const whatsappSubscribers = await db.collection('subscribers').countDocuments({
      'preferences.whatsapp': true
    })
    
    const newsletterSubscribers = await db.collection('subscribers').countDocuments({
      'preferences.newsletter': true
    })
    
    // Get growth data (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const growthData = await db.collection('subscribers').aggregate([
      {
        $match: {
          subscribedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscribedAt' },
            month: { $month: '$subscribedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray()
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalSubscribers,
          active: activeSubscribers,
          inactive: totalSubscribers - activeSubscribers,
          recent: recentSubscribers,
          withMobile: subscribersWithMobile
        },
        preferences: {
          email: emailSubscribers,
          sms: smsSubscribers,
          whatsapp: whatsappSubscribers,
          newsletter: newsletterSubscribers
        },
        sources: subscribersBySource,
        growth: growthData
      }
    })
  } catch (error: any) {
    console.error('Error fetching subscriber stats:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch subscriber statistics',
        error: error.message
      },
      { status: 500 }
    )
  }
}