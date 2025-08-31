import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

interface Template {
  id: string
  name: string
  category: 'contact-us' | 'subscribers' | 'news' | 'achievements'
  type: 'whatsapp' | 'sms' | 'email'
  subject?: string
  content: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

// GET - Fetch all templates
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const templates = await db.collection('communication_templates')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        ...template,
        id: template._id.toString(),
        _id: undefined
      }))
    })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const template: Template = await request.json()
    
    // Validate required fields
    if (!template.name || !template.content || !template.category || !template.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email templates have subject
    if (template.type === 'email' && !template.subject) {
      return NextResponse.json(
        { success: false, error: 'Email templates must have a subject' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    const templateDoc = {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('communication_templates').insertOne(templateDoc)
    
    return NextResponse.json({
      success: true,
      template: {
        ...templateDoc,
        id: result.insertedId.toString()
      }
    })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

// PUT - Update existing template
export async function PUT(request: NextRequest) {
  try {
    const template: Template = await request.json()
    
    if (!template.id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = require('mongodb')
    
    const updateDoc = {
      ...template,
      updatedAt: new Date(),
      _id: undefined,
      id: undefined
    }
    
    const result = await db.collection('communication_templates').updateOne(
      { _id: new ObjectId(template.id) },
      { $set: updateDoc }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      template: {
        ...updateDoc,
        id: template.id
      }
    })
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}