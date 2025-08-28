import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { achievementSchema, type Achievement } from "@/lib/schemas/achievement"

// Re-export the schema and type for backward compatibility
export { achievementSchema, type Achievement }

// Helper function to handle errors
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error)
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
  return NextResponse.json({ error: errorMessage }, { status: 500 })
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const achievements = await db.collection<Achievement>("achievements").find({}).sort({ createdAt: -1 }).toArray()

    // Helper function to safely convert dates to ISO strings
    const toISOStringSafe = (date: unknown): string | undefined => {
      if (!date) return undefined
      try {
        const dateObj = date instanceof Date ? date : new Date(date as string)
        return isNaN(dateObj.getTime()) ? undefined : dateObj.toISOString()
      } catch {
        return undefined
      }
    }

    // Convert ObjectId to string for JSON serialization with safe date handling
    const serializedAchievements = achievements.map((achievement) => {
      const now = new Date()
      return {
        ...achievement,
        _id: achievement._id?.toString(),
        date: toISOStringSafe(achievement.date) || now.toISOString(),
        createdAt: toISOStringSafe(achievement.createdAt) || now.toISOString(),
        updatedAt: toISOStringSafe(achievement.updatedAt) || now.toISOString(),
      }
    })

    return NextResponse.json(serializedAchievements)
  } catch (error) {
    return handleError(error, "GET /api/achievements")
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validate request data
    const validation = achievementSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.format() }, { status: 400 })
    }

    const validatedData = validation.data
    const client = await clientPromise
    const db = client.db()

    const achievementData: Achievement = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Achievement>("achievements").insertOne(achievementData)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId.toString(),
        message: "Achievement created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return handleError(error, "POST /api/achievements")
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
