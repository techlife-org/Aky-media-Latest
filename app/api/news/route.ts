import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

interface Attachment {
  url: string
  type: "image" | "document" | "video" | "link"
  name?: string
  order?: number
}

export async function GET() {
  console.log("[News API] Received request")
  try {
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        },
        { status: 503 },
      )
    }

    // Fetch all news articles, sorted by creation date (newest first)
    console.log("[News API] Fetching news from database")
    const news = await db.collection("news").find({}).sort({ created_at: -1 }).toArray()
    console.log(`[News API] Found ${news.length} news articles`)

    // Convert ObjectId to string and format dates safely
    const formattedNews = news.map((article) => {
      // Helper function to safely convert to ISO string
      const toSafeISOString = (date: any) => {
        if (!date) return null;
        try {
          return new Date(date).toISOString();
        } catch (e) {
          console.error('Error parsing date:', date, e);
          return null;
        }
      };

      return {
        id: article._id?.toString(),
        title: article.title,
        content: article.content,
        doc_type: article.doc_type,
        created_at: toSafeISOString(article.created_at) || new Date().toISOString(),
        updated_at: toSafeISOString(article.updated_at) || new Date().toISOString(),
        // Handle both old single attachment and new multiple attachments
        attachments: Array.isArray(article.attachments)
          ? article.attachments
          : article.attachment
            ? [article.attachment]
            : [],
        views: article.views || 0,
      };
    })

    console.log(`[News API] Returning ${formattedNews.length} formatted news articles`)
    return NextResponse.json(formattedNews)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const dbConnection = await connectToDatabase()
    const db = dbConnection.db

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const now = new Date()
    const newsData = {
      title: data.title,
      content: data.content,
      doc_type: data.doc_type || "news",
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      created_at: now,
      updated_at: now,
      views: 0,
    }

    const result = await db.collection("news").insertOne(newsData)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newsData,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
  }
}
