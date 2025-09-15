import { NextResponse } from 'next/server'
import { ObjectId, WithId, Document } from 'mongodb'
import clientPromise, { connectToDatabase } from '@/lib/mongodb'
import { corsHeaders } from '@/lib/cors'

interface NewsArticle extends WithId<Document> {
  _id: ObjectId
  title: string
  content: string
  doc_type: string
  attachment?: {
    url: string
    type: string
    name?: string
  }
  attachments?: {
    url: string
    type: string
    name?: string
  }[]
  
  created_at?: string
  updated_at?: string
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid article ID format' }),
        { status: 400, headers: corsHeaders() }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const article = await db.collection<NewsArticle>('news').findOne({
      _id: new ObjectId(params.id)
    })

    if (!article) {
      return new NextResponse(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Convert _id to string for the response and ensure both attachment formats are available
    const { _id, ...articleData } = article
    
    // Ensure backward compatibility by providing both attachment and attachments
    const attachments = articleData.attachments || (articleData.attachment ? [articleData.attachment] : [])
    const attachment = articleData.attachment || (articleData.attachments && articleData.attachments.length > 0 ? articleData.attachments[0] : undefined)
    
    return new NextResponse(
      JSON.stringify({ 
        id: _id.toString(), 
        ...articleData,
        attachment,
        attachments
      }),
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch article' }),
      { status: 500, headers: corsHeaders() }
    )
  }
}

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Validate ID format
//     if (!ObjectId.isValid(params.id)) {
//       return new NextResponse(
//         JSON.stringify({ error: 'Invalid article ID format' }),
//         { status: 400, headers: corsHeaders() }
//       )
//     }

//     const data = await request.json()
//     const { title, content, doc_type, attachment } = data

//     // Basic validation
//     if (!title || !content || !doc_type) {
//       return new NextResponse(
//         JSON.stringify({ error: 'Title, content, and category are required' }),
//         { status: 400, headers: corsHeaders() }
//       )
//     }

//     const client = await clientPromise
//     const db = client.db()

//     const updateData = {
//       title,
//       content,
//       doc_type,
//       updated_at: new Date().toISOString(),
//       ...(attachment && { attachment })
//     }

//     const result = await db.collection<NewsArticle>('news').updateOne(
//       { _id: new ObjectId(params.id) },
//       { $set: updateData }
//     )

//     if (result.matchedCount === 0) {
//       return new NextResponse(
//         JSON.stringify({ error: 'Article not found' }),
//         { status: 404, headers: corsHeaders() }
//       )
//     }

//     // Fetch the updated article to return
//     const updatedArticle = await db.collection<NewsArticle>('news').findOne({
//       _id: new ObjectId(params.id)
//     })

//     if (!updatedArticle) {
//       return new NextResponse(
//         JSON.stringify({ error: 'Failed to fetch updated article' }),
//         { status: 500, headers: corsHeaders() }
//       )
//     }

//     // Convert _id to string for the response
//     const { _id, ...articleData } = updatedArticle
//     return new NextResponse(
//       JSON.stringify({ id: _id.toString(), ...articleData }),
//       { headers: corsHeaders() }
//     )
//   } catch (error) {
//     console.error('Error updating article:', error)
//     return new NextResponse(
//       JSON.stringify({ error: 'Failed to update article' }),
//       { status: 500, headers: corsHeaders() }
//     )
//   }
// }

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate the ID parameter
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()
    const { title, content, doc_type, attachments, custom_category } = body

    // Validate required fields
    if (!title || !content || !doc_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to the database
    const client = await clientPromise
    const db = client.db()

    // Prepare the update data with proper attachments handling
    const updateData: {
      title: any;
      content: any;
      doc_type: any;
      attachments: any[];
      updated_at: string;
      custom_category?: any; // Make it optional with ?
    } = {
      title,
      content,
      doc_type,
      attachments: Array.isArray(attachments) ? attachments : [],
      updated_at: new Date().toISOString(),
    }

    // Add custom_category if provided
    if (custom_category) {
      updateData.custom_category = custom_category
    }

    console.log("[v0] Updating news with data:", updateData) // Debug log

    // Update the news article
    const result = await db.collection("news").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    console.log("[v0] Update result:", result) // Debug log

    // Check if the article was found and updated
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 })
    }

    // Fetch the updated article to return
    const updatedNews = await db.collection("news").findOne({
      _id: new ObjectId(id),
    })

    if (!updatedNews) {
      return NextResponse.json(
        { error: "Failed to fetch updated news article" },
        { status: 500 }
      )
    }

    console.log("[v0] Updated news from DB:", updatedNews) // Debug log

    // Convert ObjectId to string for JSON serialization
    const newsWithId = {
      ...updatedNews,
      _id: updatedNews._id.toString(),
      id: updatedNews._id.toString(),
    }

    return NextResponse.json(newsWithId)
  } catch (error) {
    console.error("Error updating news article:", error)
    return NextResponse.json({ error: "Failed to update news article" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid article ID format' }),
        { status: 400, headers: corsHeaders() }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // First get the article to potentially clean up attachments later
    const article = await db.collection<NewsArticle>('news').findOne({
      _id: new ObjectId(params.id)
    })

    if (!article) {
      return new NextResponse(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // TODO: Add logic to delete associated files from storage if needed
    // For now, we'll just delete the database record

    const result = await db.collection<NewsArticle>('news').deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to delete article' }),
        { status: 500, headers: corsHeaders() }
      )
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Error deleting article:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete article' }),
      { status: 500, headers: corsHeaders() }
    )
  }
}

// Handle OPTIONS method for CORS preflight
// This needs to be a named export
// @ts-ignore - Next.js will handle this
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders()
  })
}
