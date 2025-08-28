import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { projectSchema } from "@/lib/schemas/project"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const projects = await db.collection("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = projectSchema.parse({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { db } = await connectToDatabase()
    
    const result = await db.collection("projects").insertOne(validatedData)
    
    const newProject = await db.collection("projects").findOne({ _id: result.insertedId })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}