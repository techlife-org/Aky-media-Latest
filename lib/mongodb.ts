import { MongoClient, type Db, type MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env")
}

// Enhanced options for better compatibility with MongoDB Atlas
const options: MongoClientOptions = {
  // Use longer timeouts for better reliability
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 60000, // 60 seconds
  
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 1,
  
  // Retry settings (let MongoDB handle retries)
  retryWrites: true,
  retryReads: true,
  
  // DNS resolution options for better compatibility
  srvMaxHosts: 0,
  srvServiceName: "mongodb",
  
  // Use default SSL settings for Atlas
  // Don't override SSL settings as they're in the URI
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Improved connection logic with better error handling and DNS fallback
async function createConnection(): Promise<MongoClient> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Only log first attempt to reduce noise
      if (attempt === 1) {
        console.log('[MongoDB] Connecting to database...')
      }
      
      const client = new MongoClient(MONGODB_URI, options)
      
      // Connect with timeout
      await client.connect()
      
      // Test the connection
      await client.db().admin().ping()
      
      console.log('✅ [MongoDB] Connected successfully')
      return client
    } catch (error: any) {
      lastError = error
      
      // Try direct connection as fallback if SRV lookup fails
      if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
        console.log('[MongoDB] Retrying with direct connection...')
        try {
          // Try with standard connection string format
          const directUri = MONGODB_URI.replace('+srv://', '://').replace('.mongodb.net/', '.mongodb.net:27017/')
          const directClient = new MongoClient(directUri, {
            ...options,
            directConnection: true
          })
          
          await directClient.connect()
          await directClient.db().admin().ping()
          
          console.log('✅ [MongoDB] Connected successfully with direct connection')
          return directClient
        } catch (directError) {
          console.error('[MongoDB] Direct connection also failed:', directError.message)
          lastError = directError
        }
      }
      
      // Only log detailed errors on final attempt
      if (attempt === maxRetries) {
        console.error('❌ [MongoDB] Connection failed:', {
          message: error.message,
          code: error.code,
          name: error.name
        })
      }
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000 // Progressive delay: 1s, 2s, 3s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw new Error(`MongoDB connection failed: ${lastError?.message || 'Unknown error'}`)
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
    
    // Verify connection is still alive with timeout
    try {
      const pingPromise = db.admin().ping()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ping timeout')), 5000)
      )
      
      await Promise.race([pingPromise, timeoutPromise])
    } catch (pingError) {
      console.warn('[MongoDB] Ping failed, attempting to reconnect...', pingError.message)
      // If ping fails, try to reconnect silently
      try {
        const newClient = await createConnection()
        return { client: newClient, db: newClient.db() }
      } catch (reconnectError) {
        console.error('[MongoDB] Reconnection failed:', reconnectError.message)
        throw reconnectError
      }
    }
    
    return { client, db }
  } catch (error: any) {
    // Provide user-friendly error messages
    console.error('[MongoDB] Connection error:', error.message)
    
    if (error.message.includes('timeout') || error.message.includes('Ping timeout')) {
      throw new Error('Network connection timeout. Please check your internet connection.')
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      throw new Error('Database authentication failed. Please verify your credentials.')
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      throw new Error('Network error. Please check your internet connection.')
    } else if (error.message.includes('MongoServerSelectionError')) {
      throw new Error('Database server unavailable. Please try again later.')
    } else {
      throw new Error('Database connection failed. Please try again later.')
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