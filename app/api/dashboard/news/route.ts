import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { instagramService } from "@/lib/instagram-service"

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
  attachments?: Attachment[]
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

    // Convert _id to string for each document and ensure both attachment formats are available
    const formattedNews = news.map(({ _id, ...doc }) => {
      // Ensure backward compatibility by providing both attachment and attachments
      const attachments = doc.attachments || (doc.attachment ? [doc.attachment] : [])
      const attachment = doc.attachment || (doc.attachments && doc.attachments.length > 0 ? doc.attachments[0] : undefined)
      
      return {
        id: _id.toString(),
        ...doc,
        attachment,
        attachments,
        created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
        updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
      }
    });

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
    const { title, content, doc_type, attachment, attachments } = data as Omit<
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

    // Handle both attachment formats for backward compatibility
    const processedAttachments = Array.isArray(attachments) ? attachments : []
    const mainAttachment = processedAttachments.length > 0 ? processedAttachments[0] : attachment

    const now = new Date()
    const newArticle: Omit<NewsArticle, "_id"> = {
      title,
      content,
      doc_type,
      created_at: now,
      updated_at: now,
      views: 0,
      ...(processedAttachments.length > 0 && { attachments: processedAttachments }),
      ...(mainAttachment && { attachment: mainAttachment }),
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
    const newsId = _id.toString()
    
    // Initialize Instagram post status
    let instagramPostStatus = {
      attempted: false,
      success: false,
      error: null as string | null,
      postId: null as string | null,
    }

    // Attempt to post to Instagram if image is available
    const imageAttachment = mainAttachment || attachment
    if (imageAttachment?.url && imageAttachment.type === "image") {
      try {
        console.log('Attempting to post news to Instagram...', { newsId, title })
        
        // Get base URL from environment or request headers
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
        
        const instagramResult = await instagramService.postToInstagram({
          title,
          content,
          imageUrl: imageAttachment.url,
          newsId,
          baseUrl,
        })
        
        instagramPostStatus = {
          attempted: true,
          success: instagramResult.success,
          error: instagramResult.error || null,
          postId: instagramResult.postId || null,
        }
        
        if (instagramResult.success) {
          console.log('News successfully posted to Instagram:', {
            newsId,
            instagramPostId: instagramResult.postId,
          })
        } else {
          console.warn('Instagram posting failed:', {
            newsId,
            error: instagramResult.error,
          })
        }
      } catch (instagramError) {
        console.error('Instagram posting error:', instagramError)
        instagramPostStatus = {
          attempted: true,
          success: false,
          error: instagramError instanceof Error ? instagramError.message : 'Unknown Instagram error',
          postId: null,
        }
      }
    } else {
      console.log('Skipping Instagram post - no image attachment available', { newsId })
      instagramPostStatus.error = 'No image attachment available for Instagram posting'
    }

    // Return success response with both news data and Instagram status
    return NextResponse.json(
      { 
        id: newsId, 
        ...articleData,
        instagramPostStatus,
      },
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
