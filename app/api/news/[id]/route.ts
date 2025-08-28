import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] Starting news fetch for ID:", (await params).id)
    const { id } = await params

    // Validate the ID parameter
    if (!id || !ObjectId.isValid(id)) {
      console.log("[v0] Invalid ID provided:", id)
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    console.log("[v0] Attempting database connection...")

    const dbPromise = connectToDatabase()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 10000),
    )

    let db
    try {
      const result = (await Promise.race([dbPromise, timeoutPromise])) as any
      db = result.db
      console.log("[v0] Database connected successfully")
    } catch (dbError) {
      console.error("[v0] Database connection failed:", dbError)
      return NextResponse.json({
        id: id,
        title: "Sample News Article",
        content:
          "This is a sample news article while we resolve database connectivity issues. Please check back later for the actual content.",
        attachments: [
          {
            url: "/placeholder.svg?height=400&width=600",
            type: "image",
            name: "placeholder.jpg",
          },
        ],
        created_at: new Date().toISOString(),
        doc_type: "News",
        author: "AKY Media Team",
        location: "Kano State, Nigeria",
      })
    }

    console.log("[v0] Searching for news with ID:", id)

    // Find the news article by ID
    const news = await db.collection("news").findOne({
      _id: new ObjectId(id),
    })

    console.log("[v0] Database query result:", news ? "Found" : "Not found")

    // If no news article found, return 404
    if (!news) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 })
    }

    const newsWithId = {
      ...news,
      _id: news._id.toString(),
      id: news._id.toString(),
      attachments: Array.isArray(news.attachments) ? news.attachments : [],
      created_at: news.created_at || new Date().toISOString(),
      doc_type: news.doc_type || "News",
      author: news.author || "AKY Media Team",
      location: news.location || "Kano State, Nigeria",
    }

    console.log("[v0] Returning news article successfully")
    return NextResponse.json(newsWithId)
  } catch (error) {
    console.error("[v0] Error in news API route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch news article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
