import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get subscribers from database
    const subscribers = await db.collection("subscribers").find({}).toArray()

    // Calculate stats
    const total = subscribers.length
    const active = subscribers.filter((sub) => sub.status === "active").length
    const thisMonth = subscribers.filter((sub) => {
      const subDate = new Date(sub.subscribedAt)
      const now = new Date()
      return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
    }).length

    const lastMonth = subscribers.filter((sub) => {
      const subDate = new Date(sub.subscribedAt)
      const now = new Date()
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return subDate.getMonth() === lastMonthDate.getMonth() && subDate.getFullYear() === lastMonthDate.getFullYear()
    }).length

    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    return NextResponse.json({
      subscribers: subscribers.map((sub) => ({
        id: sub._id.toString(),
        email: sub.email,
        subscribedAt: sub.subscribedAt,
        status: sub.status || "active",
        source: sub.source || "Newsletter",
      })),
      stats: {
        total,
        active,
        thisMonth,
        growthRate: Math.round(growthRate * 10) / 10,
      },
    })
  } catch (error) {
    console.error("Subscribers API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
