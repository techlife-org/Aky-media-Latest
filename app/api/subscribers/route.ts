import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { validateAndFormatPhone } from '@/lib/phone-utils'

// GET - Retrieve subscribers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'subscribedAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    
    const { db } = await connectToDatabase()
    
    // Build filter query
    const filter: any = {}
    
    if (status) filter.status = status
    if (source) filter.source = source
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Get total count
    const total = await db.collection('subscribers').countDocuments(filter)
    
    // Get subscribers with pagination
    const subscribers = await db.collection('subscribers')
      .find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch subscribers',
        error: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, mobile, source, preferences } = body
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "First name, last name, and email are required" },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      )
    }
    
    // Validate and format phone number if provided
    let formattedPhone = "";
    if (mobile && mobile.trim()) {
      const phoneValidation = validateAndFormatPhone(mobile.trim());
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: phoneValidation.error || 'Please enter a valid phone number'
          },
          { status: 400 }
        );
      }
      formattedPhone = phoneValidation.formattedPhone || "";
    }
    
    const { db } = await connectToDatabase()
    
    // Check if subscriber already exists
    const existingSubscriber = await db.collection('subscribers').findOne({ email })
    
    if (existingSubscriber) {
      return NextResponse.json(
        { 
          success: false,
          message: "Email address is already subscribed"
        },
        { status: 409 }
      )
    }
    
    // Create new subscriber
    const subscriber = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      mobile: formattedPhone,
      source: source || 'manual',
      status: 'active',
      subscribedAt: new Date(),
      preferences: {
        email: true,
        sms: !!formattedPhone,
        whatsapp: !!formattedPhone,
        newsletter: true,
        updates: true,
        promotions: false,
        ...preferences
      },
      tags: [source || 'manual'],
      metadata: {
        subscriptionMethod: source || 'manual',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    }
    
    const result = await db.collection('subscribers').insertOne(subscriber)
    
    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: "Subscriber added successfully",
        subscriberId: result.insertedId.toString()
      })
    } else {
      throw new Error("Failed to add subscriber")
    }
  } catch (error: any) {
    console.error('Error adding subscriber:', error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to add subscriber",
        error: error.message
      },
      { status: 500 }
    )
  }
}

// PUT - Update subscriber
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, email, mobile, status, preferences, tags } = body
    
    if (!id) {
      return NextResponse.json(
        { message: "Subscriber ID is required" },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Validate and format phone number if provided
    let formattedPhone = mobile;
    if (mobile && mobile.trim()) {
      const phoneValidation = validateAndFormatPhone(mobile.trim());
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: phoneValidation.error || 'Please enter a valid phone number'
          },
          { status: 400 }
        );
      }
      formattedPhone = phoneValidation.formattedPhone;
    }
    
    const updateData: any = {
      lastUpdated: new Date()
    }
    
    if (firstName) updateData.firstName = firstName.trim()
    if (lastName) updateData.lastName = lastName.trim()
    if (email) updateData.email = email.toLowerCase().trim()
    if (formattedPhone !== undefined) updateData.mobile = formattedPhone
    if (status) updateData.status = status
    if (preferences) updateData.preferences = preferences
    if (tags) updateData.tags = tags
    
    const result = await db.collection('subscribers').updateOne(
      { _id: new (require('mongodb')).ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Subscriber updated successfully"
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          message: "Subscriber not found or no changes made"
        },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to update subscriber",
        error: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: "Subscriber ID is required" },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    const result = await db.collection('subscribers').deleteOne({
      _id: new (require('mongodb')).ObjectId(id)
    })
    
    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Subscriber removed successfully"
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          message: "Subscriber not found"
        },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error removing subscriber:', error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to remove subscriber",
        error: error.message
      },
      { status: 500 }
    )
  }
}