import { MongoClient, type Db, type MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// Recommended options for production
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
  socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  retryWrites: true, // Retry operations that fail due to transient network errors
  retryReads: true, // Retry read operations
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Minimum 1 connection in the pool
  ssl: true, // Use SSL/TLS for connection
  appName: "techlife-web-app", // Application name for monitoring
  // Removed directConnection as it's incompatible with mongodb+srv URIs
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "production") {
  // In production mode, it's best to not use a global variable.
  // This avoids issues with hot-reloading and ensures a fresh connection
  // for each deployment.
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB connection error in production:", err)
    // In production, you might want to crash the app or use a more robust error handling
    throw err // Re-throw to indicate a critical error
  }) as Promise<MongoClient>
} else {
  // In development mode, use a global variable so that the client is preserved
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error in development:", err)
      throw err
    })
  }
  clientPromise = global._mongoClientPromise
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db()
    // Test the connection by sending a ping command
    await db.command({ ping: 1 })
    return { client, db }
  } catch (error: any) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error(`Database connection failed: ${error.message}`)
  }
}

export default clientPromise
