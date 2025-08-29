import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active'; // Default to active subscribers
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';

    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      // Return a default response when database is not available
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    // Build query based on status and search
    const query: any = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await db.collection("subscribers").countDocuments(query);
    
    // Get subscribers from database with pagination
    const subscribers = await db.collection("subscribers")
      .find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get all subscribers for stats (without pagination)
    const allSubscribers = await db.collection("subscribers").find({}).toArray();

    // Calculate stats using all subscribers
    const total = allSubscribers.length
    const active = allSubscribers.filter((sub) => sub.status === "active").length
    const unsubscribed = allSubscribers.filter((sub) => sub.status === "unsubscribed").length
    const terminated = allSubscribers.filter((sub) => sub.status === "terminated").length
    const thisMonth = allSubscribers.filter((sub) => {
      const subDate = new Date(sub.subscribedAt)
      const now = new Date()
      return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
    }).length
    const lastMonth = allSubscribers.filter((sub) => {
      const subDate = new Date(sub.subscribedAt)
      const now = new Date()
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return subDate.getMonth() === lastMonthDate.getMonth() && subDate.getFullYear() === lastMonthDate.getFullYear()
    }).length
    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0
    const emailVerified = allSubscribers.filter((sub) => sub.emailVerified).length
    const phoneVerified = allSubscribers.filter((sub) => sub.phoneVerified).length

    return NextResponse.json({
      subscribers: subscribers.map((sub) => ({
        id: sub._id.toString(),
        email: sub.email,
        phone: sub.phone || null,
        name: sub.name || null,
        subscribedAt: sub.subscribedAt,
        unsubscribedAt: sub.unsubscribedAt || null,
        status: sub.status || "active",
        source: sub.source || "Newsletter",
        lastActive: sub.lastActive || null,
        emailVerified: sub.emailVerified || false,
        phoneVerified: sub.phoneVerified || false,
        preferences: sub.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          whatsappNotifications: false
        }
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        total,
        active,
        unsubscribed,
        terminated,
        thisMonth,
        growthRate: Math.round(growthRate * 10) / 10,
        emailVerified,
        phoneVerified
      },
    })
  } catch (error) {
    console.error("Subscribers API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
