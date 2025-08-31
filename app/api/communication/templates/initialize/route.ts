import { NextRequest, NextResponse } from 'next/server'
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service'

// POST - Initialize default templates
export async function POST(request: NextRequest) {
  try {
    const notificationService = new EnhancedNotificationService();
    await notificationService.initializeDefaultTemplates();
    
    return NextResponse.json({
      success: true,
      message: 'Default templates initialized successfully'
    })
  } catch (error) {
    console.error('Failed to initialize default templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize default templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check if default templates exist
export async function GET() {
  try {
    const { connectToDatabase } = await import('@/lib/mongodb');
    const { db } = await connectToDatabase();
    
    const templateCounts = await db.collection('communication_templates').aggregate([
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const expectedTemplates = [
      { category: 'subscribers', type: 'email' },
      { category: 'subscribers', type: 'sms' },
      { category: 'subscribers', type: 'whatsapp' },
      { category: 'contact-us', type: 'email' },
      { category: 'contact-us', type: 'sms' },
      { category: 'contact-us', type: 'whatsapp' }
    ];
    
    const existingTemplates = templateCounts.map(t => `${t._id.category}-${t._id.type}`);
    const missingTemplates = expectedTemplates.filter(
      t => !existingTemplates.includes(`${t.category}-${t.type}`)
    );
    
    return NextResponse.json({
      success: true,
      data: {
        totalTemplates: templateCounts.length,
        existingTemplates: templateCounts,
        missingTemplates,
        needsInitialization: missingTemplates.length > 0
      }
    })
  } catch (error) {
    console.error('Failed to check templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}