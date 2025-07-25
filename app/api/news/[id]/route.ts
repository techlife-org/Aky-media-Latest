import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || '';

// Helper function to connect to the database
async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the ID parameter
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectToDatabase();
    
    // Find the news article by ID
    const news = await db.collection('news').findOne({
      _id: new ObjectId(params.id)
    });

    // If no news article found, return 404
    if (!news) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const newsWithId = {
      ...news,
      _id: news._id.toString(),
      id: news._id.toString()
    };

    // Return the news article
    return NextResponse.json(newsWithId);
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}
