// Fallback MongoDB configuration for development when Atlas is unavailable
import { MongoClient, type Db, type MongoClientOptions } from "mongodb"

// Global in-memory storage that persists across requests during development
const globalCollections = new Map<string, any[]>()

// In-memory storage for development fallback
class MemoryDatabase {
  private collections: Map<string, any[]> = globalCollections
  
  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, [])
    }
    
    const data = this.collections.get(name)!
    
    return {
      async findOne(query: any) {
        const items = data.filter(item => {
          if (query._id) return item._id?.toString() === query._id.toString()
          return Object.keys(query).every(key => {
            if (key.includes('.')) {
              // Handle nested queries like "permissions.canCreateBroadcast"
              const keys = key.split('.')
              let value = item
              for (const k of keys) {
                value = value?.[k]
              }
              return value === query[key]
            }
            return item[key] === query[key]
          })
        })
        return items[0] || null
      },
      
      async find(query: any = {}) {
        const items = data.filter(item => {
          return Object.keys(query).every(key => {
            if (key.includes('.')) {
              // Handle nested queries
              const keys = key.split('.')
              let value = item
              for (const k of keys) {
                value = value?.[k]
              }
              return value === query[key]
            }
            return item[key] === query[key]
          })
        })
        return {
          toArray: async () => items,
          sort: () => ({ toArray: async () => items }),
          limit: () => ({ toArray: async () => items }),
          skip: () => ({ toArray: async () => items })
        }
      },
      
      async insertOne(doc: any) {
        const id = Math.random().toString(36).substring(2, 15)
        const newDoc = { ...doc, _id: id }
        data.push(newDoc)
        console.log(`📝 Fallback DB: Inserted document into ${name}:`, { id: newDoc.id || id, email: newDoc.email })
        return { insertedId: id }
      },
      
      async updateOne(query: any, update: any) {
        const index = data.findIndex(item => {
          if (query._id) return item._id?.toString() === query._id.toString()
          return Object.keys(query).every(key => item[key] === query[key])
        })
        
        if (index !== -1) {
          if (update.$set) {
            Object.assign(data[index], update.$set)
          }
          if (update.$inc) {
            Object.keys(update.$inc).forEach(key => {
              data[index][key] = (data[index][key] || 0) + update.$inc[key]
            })
          }
          if (update.$push) {
            Object.keys(update.$push).forEach(key => {
              if (!data[index][key]) {
                data[index][key] = []
              }
              data[index][key].push(update.$push[key])
            })
          }
          if (update.$pull) {
            Object.keys(update.$pull).forEach(key => {
              if (data[index][key] && Array.isArray(data[index][key])) {
                const pullQuery = update.$pull[key]
                data[index][key] = data[index][key].filter((item: any) => {
                  return !Object.keys(pullQuery).every(pullKey => item[pullKey] === pullQuery[pullKey])
                })
              }
            })
          }
          console.log(`📝 Fallback DB: Updated document in ${name}`, { operation: Object.keys(update).join(', ') })
          return { matchedCount: 1, modifiedCount: 1 }
        }
        return { matchedCount: 0, modifiedCount: 0 }
      },
      
      async deleteOne(query: any) {
        const index = data.findIndex(item => {
          if (query._id) return item._id?.toString() === query._id.toString()
          return Object.keys(query).every(key => item[key] === query[key])
        })
        
        if (index !== -1) {
          data.splice(index, 1)
          console.log(`📝 Fallback DB: Deleted document from ${name}`)
          return { deletedCount: 1 }
        }
        return { deletedCount: 0 }
      },
      
      async updateMany(query: any, update: any) {
        let modifiedCount = 0
        data.forEach((item, index) => {
          const matches = Object.keys(query).every(key => item[key] === query[key])
          if (matches) {
            if (update.$set) {
              Object.assign(data[index], update.$set)
            }
            if (update.$inc) {
              Object.keys(update.$inc).forEach(key => {
                data[index][key] = (data[index][key] || 0) + update.$inc[key]
              })
            }
            if (update.$push) {
              Object.keys(update.$push).forEach(key => {
                if (!data[index][key]) {
                  data[index][key] = []
                }
                data[index][key].push(update.$push[key])
              })
            }
            modifiedCount++
          }
        })
        console.log(`📝 Fallback DB: Updated ${modifiedCount} documents in ${name}`)
        return { matchedCount: modifiedCount, modifiedCount }
      },
      
      async countDocuments(query: any = {}) {
        const items = data.filter(item => {
          return Object.keys(query).every(key => item[key] === query[key])
        })
        return items.length
      },
      
      async listCollections() {
        return {
          toArray: async () => Array.from(globalCollections.keys()).map(name => ({ name }))
        }
      }
    }
  }
  
  admin() {
    return {
      async ping() {
        return { ok: 1 }
      },
      async serverStatus() {
        return {
          version: "fallback-1.0.0",
          host: "localhost-fallback",
          uptime: 3600
        }
      }
    }
  }
  
  async command(cmd: any) {
    if (cmd.ping) return { ok: 1 }
    return { ok: 1 }
  }
}

// Singleton instance to maintain data across requests
let memoryDbInstance: MemoryDatabase | null = null

function getMemoryDatabase(): MemoryDatabase {
  if (!memoryDbInstance) {
    memoryDbInstance = new MemoryDatabase()
    console.log("🔄 Created new fallback database instance")
  }
  return memoryDbInstance
}

export async function connectToDatabaseFallback(): Promise<{ client: any; db: any }> {
  console.log("⚠️  Using fallback in-memory database for development")
  console.log("📝 Note: Data persists across requests but not server restarts")
  
  const memoryDb = getMemoryDatabase()
  
  return {
    client: {
      close: async () => console.log("Fallback database connection closed"),
      db: () => memoryDb
    },
    db: memoryDb
  }
}

// Enhanced MongoDB connection with aggressive fallback
export async function connectToDatabaseWithFallback(): Promise<{ client: any; db: any }> {
  let MONGODB_URI = process.env.MONGODB_URI
  
  if (!MONGODB_URI) {
    console.warn("⚠️  No MONGODB_URI found, using fallback database")
    return connectToDatabaseFallback()
  }
  
  // Clean the URI to remove overly restrictive timeout parameters that cause connection failures
  // The connection takes about 12 seconds, so we need more generous timeouts
  const cleanUri = MONGODB_URI.replace(/&serverSelectionTimeoutMS=\d+/, '')
                              .replace(/&connectTimeoutMS=\d+/, '')
                              .replace(/&socketTimeoutMS=\d+/, '')
                              .replace(/\?serverSelectionTimeoutMS=\d+&/, '?')
                              .replace(/\?connectTimeoutMS=\d+&/, '?')
                              .replace(/\?socketTimeoutMS=\d+&/, '?')
                              .replace(/&serverSelectionTimeoutMS=\d+$/, '')
                              .replace(/&connectTimeoutMS=\d+$/, '')
                              .replace(/&socketTimeoutMS=\d+$/, '');
  
  // Reasonable connection timeouts for proper MongoDB connection
  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: 15000, // 15 seconds for server selection (connection takes ~12 seconds)
    connectTimeoutMS: 15000, // 15 seconds for connection
    socketTimeoutMS: 30000, // 30 seconds for socket operations
    retryWrites: true,
    retryReads: true,
    ssl: true,
    tls: true,
    appName: "techlife" // Match the appName in your connection string
  }
  
  try {
    console.log("🔄 Attempting MongoDB Atlas connection with clean URI...")
    console.log("Original URI:", MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'))
    console.log("Clean URI:", cleanUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'))
    
    const client = new MongoClient(cleanUri, options)
    
    // Give reasonable time for connection (increased to 20 seconds)
    const connectionPromise = Promise.race([
      client.connect().then(() => client.db().admin().ping()).then(() => client),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000)
      )
    ])
    
    const connectedClient = await connectionPromise as MongoClient
    console.log("✅ MongoDB Atlas connection successful")
    return { client: connectedClient, db: connectedClient.db() }
  } catch (error: any) {
    console.warn("⚠️  MongoDB Atlas connection failed:", error.message)
    if (error.message.includes('timeout')) {
      console.log("💡 Connection timeout may be due to network latency. The connection takes about 12 seconds.")
    }
    console.log("🔄 Using fallback database")
    
    return connectToDatabaseFallback()
  }
}

// Initialize default admin in fallback database if needed
export async function initializeFallbackAdmin() {
  const { db } = await connectToDatabaseFallback()
  
  const adminEmail = process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com'
  const adminPassword = process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
  const adminName = process.env.BROADCAST_ADMIN_NAME || 'Broadcast Administrator'
  
  // Check if admin already exists
  const existingAdmin = await db.collection("broadcastAdmins").findOne({ email: adminEmail })
  
  if (!existingAdmin) {
    const bcryptjs = require('bcryptjs')
    const hashedPassword = await bcryptjs.hash(adminPassword, 12)
    
    const admin = {
      id: Math.random().toString(36).substring(2, 15),
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'super_admin',
      permissions: {
        canCreateBroadcast: true,
        canManageBroadcast: true,
        canViewAnalytics: true,
        canManageParticipants: true,
        canAccessChat: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        title: 'Chief Broadcast Administrator',
        department: 'AKY Media Center',
        avatar: null,
        phone: null
      },
      broadcastSettings: {
        defaultTitle: "Governor's Live Address",
        autoRecord: false,
        maxParticipants: 1000,
        allowScreenShare: true,
        allowChat: true,
        allowReactions: true
      }
    }
    
    await db.collection("broadcastAdmins").insertOne(admin)
    console.log("✅ Initialized default admin in fallback database")
  }
}

export default connectToDatabaseWithFallback