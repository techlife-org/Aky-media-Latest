import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// Import schema from shared location
import { achievementSchema, type Achievement } from "@/lib/schemas/achievement"

type Params = {
  params: {
    id: string
  }
}

// Helper function to handle errors
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error)
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
  return NextResponse.json({ error: errorMessage }, { status: 500 })
}

// Helper to validate and parse ObjectId
const validateObjectId = (id: string) => {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid achievement ID")
  }
  return new ObjectId(id)
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = params
    const objectId = validateObjectId(id)

    const client = await clientPromise
    const db = client.db()

    const achievement = await db.collection<Achievement>("achievements").findOne({
      _id: objectId,
    })

    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }

    // Convert ObjectId to string for JSON serialization and handle dates safely
    const safeToISOString = (date: any) => {
      if (!date) return null
      try {
        return date instanceof Date ? date.toISOString() : new Date(date).toISOString()
      } catch (e) {
        console.error("Error parsing date:", date, e)
        return null
      }
    }

    const serializedAchievement = {
      ...achievement,
      _id: achievement._id?.toString(),
      date: safeToISOString(achievement.date),
      createdAt: safeToISOString(achievement.createdAt) || new Date().toISOString(),
      updatedAt: safeToISOString(achievement.updatedAt) || new Date().toISOString(),
    }

    return NextResponse.json(serializedAchievement)
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid achievement ID") {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 })
    }
    return handleError(error, `GET /api/achievements/${params?.id}`)
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    if (!id) {
      return NextResponse.json({ error: "Achievement ID is required" }, { status: 400 })
    }

    const objectId = validateObjectId(id)
    const data = await req.json()

    // Validate request data
    const validation = achievementSchema.partial().safeParse(data)
    if (!validation.success) {
      console.error("Validation error:", validation.error.format())
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 },
      )
    }

    const validatedData = validation.data
    const client = await clientPromise
    const db = client.db()

    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    }

    // Helper function for safe date serialization
    const safeToISOString = (date: any) => {
      if (!date) return null
      try {
        return date instanceof Date ? date.toISOString() : new Date(date).toISOString()
      } catch (e) {
        console.error("Error parsing date:", date, e)
        return null
      }
    }

    const result = await db.collection<Achievement>("achievements").findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        projection: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          status: 1,
          progress: 1,
          date: 1,
          location: 1,
          impact: 1,
          details: 1,
          icon: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    )

    if (!result) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }

    const updatedAchievement = result

    // Convert ObjectId to string for JSON serialization with safe date handling
    const serializedAchievement = {
      ...updatedAchievement,
      _id: updatedAchievement._id?.toString(),
      date: safeToISOString(updatedAchievement.date),
      createdAt: safeToISOString(updatedAchievement.createdAt) || new Date().toISOString(),
      updatedAt: safeToISOString(updatedAchievement.updatedAt) || new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: serializedAchievement,
      message: "Achievement updated successfully",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid achievement ID") {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 })
    }
    return handleError(error, `PUT /api/achievements/${context.params?.id}`)
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    // Get ID from context params
    const { id } = context.params

    // Validate ID is provided
    if (!id) {
      return NextResponse.json({ error: "Achievement ID is required" }, { status: 400 })
    }

    // Validate and convert ID to ObjectId
    let objectId
    try {
      objectId = validateObjectId(id)
    } catch (error) {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // First get the achievement to return it in the response
    const achievement = await db.collection<Achievement>("achievements").findOne({
      _id: objectId,
    })

    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }

    // Then delete it
    const result = await db.collection<Achievement>("achievements").deleteOne({
      _id: objectId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Achievement not found or already deleted" }, { status: 404 })
    }

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
    const now = new Date()
    const serializedAchievement = {
      ...achievement,
      _id: achievement._id?.toString(),
      date: toISOStringSafe(achievement.date) || now.toISOString(),
      createdAt: toISOStringSafe(achievement.createdAt) || now.toISOString(),
      updatedAt: toISOStringSafe(achievement.updatedAt) || now.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: serializedAchievement,
      message: "Achievement deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/achievements/[id]:", error)
    if (error instanceof Error && error.message === "Invalid achievement ID") {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 })
    }
    return handleError(error, `DELETE /api/achievements/${context.params?.id}`)
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
