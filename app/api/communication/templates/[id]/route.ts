import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// DELETE - Delete a specific template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = require('mongodb')
    
    const result = await db.collection('communication_templates').deleteOne({
      _id: new ObjectId(templateId)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}

// GET - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = require('mongodb')
    
    const template = await db.collection('communication_templates').findOne({
      _id: new ObjectId(templateId)
    })
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      template: {
        ...template,
        id: template._id.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error('Failed to fetch template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}