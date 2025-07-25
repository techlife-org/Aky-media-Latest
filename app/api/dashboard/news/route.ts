import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

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

// GET /api/dashboard/news - Get all news articles
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const news = await db
      .collection<NewsArticle>("news")
      .find({})
      .sort({ created_at: -1 }) // Sort by creation date, newest first
      .toArray()

    // Convert _id to string for each document
    const formattedNews = news.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/news - Create a new news article
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { title, content, doc_type, attachment } = data as Omit<
      NewsArticle,
      "_id" | "created_at" | "updated_at" | "views"
    >

    // Basic validation
    if (!title || !content || !doc_type) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const newArticle: Omit<NewsArticle, "_id"> = {
      title,
      content,
      doc_type,
      created_at: now,
      updated_at: now,
      views: 0,
      ...(attachment && { attachment }),
    }

    const result = await db.collection<NewsArticle>("news").insertOne(newArticle)
    const insertedId = result.insertedId

    // Fetch the complete inserted document
    const createdArticle = await db.collection<NewsArticle>("news").findOne({
      _id: insertedId,
    })

    // Convert _id to string for the response
    const { _id, ...articleData } = createdArticle
    return NextResponse.json(
      { id: _id.toString(), ...articleData },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    )
  }
}

// Add support for other HTTP methods if needed
export { default as PUT } from "./[id]/route"
export { default as DELETE } from "./[id]/route"
