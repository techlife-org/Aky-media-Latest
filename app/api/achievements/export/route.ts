import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { type Achievement } from "@/lib/schemas/achievement"

// Helper function to handle errors
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error)
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
  return NextResponse.json({ error: errorMessage }, { status: 500 })
}

// Helper function to convert data to CSV format
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ""

  // Define headers
  const headers = [
    "ID",
    "Title", 
    "Description",
    "Category",
    "Status",
    "Progress (%)",
    "Date",
    "Location",
    "Impact",
    "Details",
    "Created At",
    "Updated At"
  ]

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map(row => [
      `"${row._id || ''}"`,
      `"${(row.title || '').replace(/"/g, '""')}"`,
      `"${(row.description || '').replace(/"/g, '""')}"`,
      `"${row.category || ''}"`,
      `"${row.status || ''}"`,
      `"${row.progress || 0}"`,
      `"${row.date || ''}"`,
      `"${(row.location || '').replace(/"/g, '""')}"`,
      `"${(row.impact || '').replace(/"/g, '""')}"`,
      `"${Array.isArray(row.details) ? row.details.join('; ').replace(/"/g, '""') : ''}"`,
      `"${row.createdAt || ''}"`,
      `"${row.updatedAt || ''}"`
    ].join(","))
  ].join("\n")

  return csvContent
}

// Helper function to format date for filename
const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const client = await clientPromise
    const db = client.db()

    // Build query based on filters
    const query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    // Fetch achievements with filters
    const achievements = await db
      .collection<Achievement>("achievements")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Helper function to safely format dates
    const formatDate = (date: unknown): string => {
      if (!date) return ""
      try {
        const dateObj = date instanceof Date ? date : new Date(date as string)
        return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString()
      } catch {
        return ""
      }
    }

    const formatDateTime = (date: unknown): string => {
      if (!date) return ""
      try {
        const dateObj = date instanceof Date ? date : new Date(date as string)
        return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleString()
      } catch {
        return ""
      }
    }

    // Prepare data for export
    const exportData = achievements.map((achievement) => ({
      _id: achievement._id?.toString() || '',
      title: achievement.title || '',
      description: achievement.description || '',
      category: achievement.category || '',
      status: achievement.status || '',
      progress: achievement.progress || 0,
      date: formatDate(achievement.date),
      location: achievement.location || '',
      impact: achievement.impact || '',
      details: achievement.details || [],
      createdAt: formatDateTime(achievement.createdAt),
      updatedAt: formatDateTime(achievement.updatedAt)
    }))

    if (format === 'csv') {
      const csvContent = convertToCSV(exportData)
      const filename = `achievements_export_${formatDateForFilename(new Date())}.csv`
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else if (format === 'json') {
      const filename = `achievements_export_${formatDateForFilename(new Date())}.json`
      
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      return NextResponse.json({ error: "Unsupported format. Use 'csv' or 'json'" }, { status: 400 })
    }

  } catch (error) {
    return handleError(error, "GET /api/achievements/export")
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}