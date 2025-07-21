import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface Attachment {
  url: string
  type: "image" | "document" | "video" | "link"
  name?: string
}

interface NewsArticle {
  _id?: ObjectId
  title: string
  content: string
  doc_type: string
  attachment?: Attachment
  created_at: Date
  updated_at: Date
  views: number
}

export async function POST(request: Request) {
  try {
    const { title, content, doc_type, attachment } = (await request.json()) as Omit<
      NewsArticle,
      "_id" | "created_at" | "updated_at" | "views"
    >
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

    const newsArticle: Omit<NewsArticle, "_id"> = {
      title,
      content,
      doc_type,
      ...(attachment && { attachment }),
      created_at: new Date(),
      updated_at: new Date(),
      views: 0,
    }

    const result = await db.collection<NewsArticle>("news").insertOne(newsArticle as any) // Type assertion for _id

    const insertedArticle = await db.collection<NewsArticle>("news").findOne({ _id: result.insertedId })
    if (!insertedArticle) {
      throw new Error("Failed to create news article")
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        id: result.insertedId.toString(),
        ...insertedArticle,
        _id: result.insertedId.toString(), // Ensure _id is stringified in response
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  } catch (error: any) {
    console.error("Error creating news article:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create news article",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    let db
    try {
      const dbConnection = await connectToDatabase()
      db = dbConnection.db
    } catch (error) {
      console.error("Database connection error:", error)
      return new NextResponse(
        JSON.stringify({
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
        }),
        { status: 503 },
      )
    }

    if (id) {
      // Get single article
      if (!ObjectId.isValid(id)) {
        return new NextResponse(JSON.stringify({ success: false, message: "Invalid article ID" }), { status: 400 })
      }
      const article = await db.collection<NewsArticle>("news").findOne({ _id: new ObjectId(id) })

      if (!article) {
        return new NextResponse(JSON.stringify({ success: false, message: "Article not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
      }

      // Convert ObjectId to string for the response
      const responseData = {
        ...article,
        _id: article._id?.toString(),
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at.toISOString(),
      }
      return new NextResponse(JSON.stringify({ success: true, data: responseData }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // Get all articles
      const articles = await db.collection<NewsArticle>("news").find().sort({ created_at: -1 }).toArray()

      // Convert ObjectIds to strings for the response
      const responseData = articles.map((article) => ({
        ...article,
        _id: article._id?.toString(),
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at.toISOString(),
      }))
      return new NextResponse(JSON.stringify({ success: true, data: responseData }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  } catch (error: any) {
    console.error("Error in news API:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "An error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
