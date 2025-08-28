import { NextResponse } from 'next/server'
import { ObjectId, WithId, Document } from 'mongodb'
import clientPromise from '@/lib/mongodb'
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

    // Convert _id to string for the response
    const { _id, ...articleData } = article
    return new NextResponse(
      JSON.stringify({ id: _id.toString(), ...articleData }),
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

export async function PUT(
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

    const data = await request.json()
    const { title, content, doc_type, attachment } = data

    // Basic validation
    if (!title || !content || !doc_type) {
      return new NextResponse(
        JSON.stringify({ error: 'Title, content, and category are required' }),
        { status: 400, headers: corsHeaders() }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const updateData = {
      title,
      content,
      doc_type,
      updated_at: new Date().toISOString(),
      ...(attachment && { attachment })
    }

    const result = await db.collection<NewsArticle>('news').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Fetch the updated article to return
    const updatedArticle = await db.collection<NewsArticle>('news').findOne({
      _id: new ObjectId(params.id)
    })

    if (!updatedArticle) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch updated article' }),
        { status: 500, headers: corsHeaders() }
      )
    }

    // Convert _id to string for the response
    const { _id, ...articleData } = updatedArticle
    return new NextResponse(
      JSON.stringify({ id: _id.toString(), ...articleData }),
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Error updating article:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update article' }),
      { status: 500, headers: corsHeaders() }
    )
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
