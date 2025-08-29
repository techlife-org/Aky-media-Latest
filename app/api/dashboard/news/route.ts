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
  let client;
  try {
    // Get a new client instance
    client = await clientPromise;
    if (!client) {
      throw new Error('MongoDB client is not connected');
    }

    const db = client.db();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    const newsCollection = db.collection<NewsArticle>('news');
    if (!newsCollection) {
      throw new Error('Failed to access news collection');
    }

    const news = await newsCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Convert _id to string for each document
    const formattedNews = news.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
      created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
      updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error('Error in GET /api/dashboard/news:', error);
    
    // More specific error messages based on error type
    let errorMessage = 'Failed to fetch news';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused. Please check if MongoDB is running.';
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes('timed out')) {
        errorMessage = 'Database connection timed out. Please try again later.';
        statusCode = 504; // Gateway Timeout
      } else if (error.message.includes('not authorized')) {
        errorMessage = 'Not authorized to access the database. Check your credentials.';
        statusCode = 401; // Unauthorized
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
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
    if (!createdArticle) {
      return NextResponse.json(
        { error: "Failed to retrieve created article" },
        { status: 500 }
      )
    }
    
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
// Note: PUT and DELETE are handled in the [id]/route.ts file for specific articles
// This route only handles GET (list all) and POST (create new)
