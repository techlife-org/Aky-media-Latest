import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        {
          message: "Service temporarily unavailable. Please try again later.",
          success: false,
          messages: []
        }, 
        { status: 503 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = Number.parseInt(url.searchParams.get("limit") || "50");
    const skip = Number.parseInt(url.searchParams.get("skip") || "0");

    try {
      // First, get all messages from contacts collection
      const messages = await db.collection("contacts")
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get total count of all messages
      const totalCount = await db.collection("contacts").countDocuments({});

      // Get status counts for sidebar
      const statusCounts = await db.collection("contacts")
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      // Convert status counts to an object
      const counts = {
        new: 0,
        read: 0,
        replied: 0,
        archived: 0,
        spam: 0,
        deleted: 0,
        sending: 0,
        sent: 0,
        ...Object.fromEntries(statusCounts.map(item => [item._id || "new", item.count]))
      };

      return NextResponse.json({
        messages,
        totalCount,
        counts,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < totalCount,
        },
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        {
          message: "Error fetching messages",
          success: false,
          messages: []
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Dashboard messages error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
        messages: [],
      },
      { status: 500 }
    );
  }
}
