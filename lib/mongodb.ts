import { MongoClient, type Db, type MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env")
}

// Enhanced options for better connectivity and reliability
// Note: Many options are already in the URI, so we keep this minimal
const options: MongoClientOptions = {
  // Only essential options not in URI
  retryWrites: true,
  retryReads: true,
  
  // SSL/TLS settings
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Additional reliability settings
  bufferMaxEntries: 0, // Disable mongoose buffering
  
  // Read/Write concerns
  readPreference: "primaryPreferred", // Prefer primary but allow secondary reads
  writeConcern: {
    w: "majority",
    j: true, // Wait for journal acknowledgment
    wtimeout: 10000
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Connection retry logic with faster fallback
async function createConnection(): Promise<MongoClient> {
  const maxRetries = 2 // Reduced retries for faster fallback
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`)
      
      const client = new MongoClient(MONGODB_URI, options)
      
      // Connect and test - let MongoDB driver handle timeouts from URI
      await client.connect()
      await client.db().admin().ping()
      
      console.log("✅ MongoDB connected successfully")
      return client
    } catch (error: any) {
      lastError = error
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxRetries) {
        const delay = 500 // Reduced delay for faster fallback
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts. Last error: ${lastError?.message}`)
}

if (process.env.NODE_ENV === "production") {
  // In production mode, create a fresh connection
  clientPromise = createConnection()
} else {
  // In development mode, use a global variable to preserve connection across HMR
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createConnection()
  }
  clientPromise = global._mongoClientPromise
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // Verify connection is still alive
    try {
      await db.admin().ping()
    } catch (pingError) {
      console.warn("MongoDB ping failed, attempting to reconnect...")
      // If ping fails, try to reconnect
      const newClient = await createConnection()
      return { client: newClient, db: newClient.db() }
    }
    
    return { client, db }
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message)
    
    // Provide more specific error messages
    if (error.message.includes("timeout")) {
      throw new Error("Database connection timeout. Please check your internet connection and try again.")
    } else if (error.message.includes("authentication")) {
      throw new Error("Database authentication failed. Please check your credentials.")
    } else if (error.message.includes("network")) {
      throw new Error("Network error connecting to database. Please check your internet connection.")
    } else {
      throw new Error(`Database connection failed: ${error.message}`)
    }
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.admin().ping()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    const client = await clientPromise
    await client.close()
    console.log("MongoDB connection closed")
  } catch (error) {
    console.error("Error closing MongoDB connection:", error)
  }
}

export default clientPromise