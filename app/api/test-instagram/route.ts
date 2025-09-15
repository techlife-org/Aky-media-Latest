import { NextResponse } from "next/server"
import { instagramService } from "@/lib/instagram-service"

/**
 * Test Instagram API connection and configuration
 * GET /api/test-instagram
 */
export async function GET() {
  try {
    console.log('Testing Instagram API connection...')
    
    // Test the connection
    const testResult = await instagramService.testConnection()
    
    return NextResponse.json({
      configured: instagramService.isConfigured(),
      ...testResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Instagram test error:', error)
    
    return NextResponse.json(
      {
        configured: instagramService.isConfigured(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Test Instagram posting with sample data
 * POST /api/test-instagram
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { 
      title = "Test News Article", 
      content = "This is a test news article to verify Instagram integration is working properly.",
      imageUrl = "https://via.placeholder.com/1080x1080/0066cc/ffffff?text=Test+News",
      newsId = "test-123"
    } = data
    
    console.log('Testing Instagram posting with sample data...')
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
    
    // Test posting
    const result = await instagramService.postToInstagram({
      title,
      content,
      imageUrl,
      newsId,
      baseUrl,
    })
    
    return NextResponse.json({
      configured: instagramService.isConfigured(),
      testData: { title, content, imageUrl, newsId, baseUrl },
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Instagram posting test error:', error)
    
    return NextResponse.json(
      {
        configured: instagramService.isConfigured(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}