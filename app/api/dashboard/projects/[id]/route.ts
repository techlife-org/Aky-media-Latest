import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { projectSchema } from "@/lib/schemas/project"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const project = await db.collection("projects").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    // Validate the request body (excluding createdAt since it shouldn't be updated)
    const validatedData = projectSchema.parse({
      ...body,
      updatedAt: new Date(),
    })

    const { db } = await connectToDatabase()
    
    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: validatedData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const updatedProject = await db.collection("projects").findOne({ 
      _id: new ObjectId(params.id) 
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    const result = await db.collection("projects").deleteOne({ 
      _id: new ObjectId(params.id) 
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}