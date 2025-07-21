import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error('Database connection error:', error);
      // Return a default response when database is not available
      return NextResponse.json({
        message: "Service temporarily unavailable. Please try again later.",
        success: false
      }, { status: 503 });
    }

    // Fetch all news articles, sorted by creation date (newest first)
    const news = await db.collection('news')  
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Convert ObjectId to string and format dates
    const formattedNews = news.map(article => ({
      id: article._id.toString(),
      title: article.title,
      content: article.content,
      doc_type: article.doc_type,
      created_at: article.created_at.toISOString(),
      attachment: article.attachment || null,
      views: article.views || 0
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
