import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: { news: [], achievements: [] } })
    }

    const dbConnection = await connectToDatabase()
    const db = dbConnection.db

    // Create search regex for case-insensitive search
    const searchRegex = new RegExp(query.trim(), "i")

    const newsResults = await db
      .collection("news")
      .find({
        $or: [
          { title: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { doc_type: { $regex: searchRegex } },
          { "attachments.name": { $regex: searchRegex } },
        ],
      })
      .sort({ created_at: -1 })
      .limit(15)
      .toArray()

    const achievementResults = await db
      .collection("achievements")
      .find({
        $or: [
          { title: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { "attachments.name": { $regex: searchRegex } },
        ],
      })
      .sort({ created_at: -1 })
      .limit(15)
      .toArray()

    const formattedNews = newsResults.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      content: item.content,
      type: "news" as const,
      doc_type: item.doc_type || "news",
      attachments: Array.isArray(item.attachments)
        ? item.attachments.map((att: any, index: number) => ({
            url: att.url || att.secure_url || att,
            type: att.type || "image",
            name: att.name || `Attachment ${index + 1}`,
            order: att.order || index,
          }))
        : item.attachment
          ? [
              {
                url: item.attachment.url || item.attachment.secure_url || item.attachment,
                type: item.attachment.type || "image",
                name: item.attachment.name || "Attachment",
                order: 0,
              },
            ]
          : [],
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      author: item.author || "AKY Media Team",
      location: item.location || "Kano State, Nigeria",
      views: item.views || 0,
    }))

    const formattedAchievements = achievementResults.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      content: item.content,
      type: "achievement" as const,
      attachments: Array.isArray(item.attachments)
        ? item.attachments.map((att: any, index: number) => ({
            url: att.url || att.secure_url || att,
            type: att.type || "image",
            name: att.name || `Achievement Image ${index + 1}`,
            order: att.order || index,
          }))
        : item.attachment
          ? [
              {
                url: item.attachment.url || item.attachment.secure_url || item.attachment,
                type: item.attachment.type || "image",
                name: item.attachment.name || "Achievement Image",
                order: 0,
              },
            ]
          : [],
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      author: item.author,
      location: item.location,
      category: item.category,
      views: item.views || 0,
    }))

    return NextResponse.json({
      results: {
        news: formattedNews,
        achievements: formattedAchievements,
      },
      query,
      total: {
        news: formattedNews.length,
        achievements: formattedAchievements.length,
        all: formattedNews.length + formattedAchievements.length,
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform search",
        results: { news: [], achievements: [] },
      },
      { status: 500 },
    )
  }
}
