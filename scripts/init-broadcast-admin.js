const { MongoClient } = require('mongodb')
const bcryptjs = require('bcryptjs')
require('dotenv').config()

async function initializeBroadcastAdmin() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set')
    process.exit(1)
  }

  // Get credentials from environment variables
  const adminEmail = process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com'
  const adminPassword = process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
  const adminName = process.env.BROADCAST_ADMIN_NAME || 'Broadcast Administrator'

  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('broadcastAdmins')
    
    // Check if admin already exists
    const existingAdmin = await collection.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('✅ Broadcast admin already exists!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password: (use the one from .env file)')
      console.log('🌐 Login URL: /broadcast-admin/login')
      console.log('📊 Dashboard URL: /dashboard/broadcast/enhanced')
      return
    }
    
    // Create default admin
    const saltRounds = 12
    const hashedPassword = await bcryptjs.hash(adminPassword, saltRounds)
    
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
    
    const result = await collection.insertOne(admin)
    
    if (result.insertedId) {
      console.log('✅ Default broadcast admin created successfully!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      console.log('🌐 Login URL: /broadcast-admin/login')
      console.log('📊 Dashboard URL: /dashboard/broadcast/enhanced')
      console.log('')
      console.log('⚠️  IMPORTANT: The credentials are now stored in your .env file!')
      console.log('⚠️  For security, consider changing the password after first login!')
    } else {
      console.error('❌ Failed to create broadcast admin')
    }
    
  } catch (error) {
    console.error('Error initializing broadcast admin:', error)
  } finally {
    await client.close()
  }
}

// Run the initialization
initializeBroadcastAdmin().catch(console.error)