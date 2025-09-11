const { MongoClient } = require('mongodb')
require('dotenv').config()

async function diagnoseConnection() {
  console.log('🔍 MongoDB Connection Diagnosis')
  console.log('==============================\n')
  
  const uri = process.env.MONGODB_URI
  console.log('📋 Environment Check:')
  console.log('MONGODB_URI exists:', !!uri)
  console.log('MONGODB_URI length:', uri?.length || 0)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('')
  
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables')
    return false
  }
  
  // Mask sensitive parts of URI for logging
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  console.log('🔗 Connection String:')
  console.log('Masked URI:', maskedUri)
  console.log('')
  
  // Test different connection strategies
  const strategies = [
    {
      name: 'Direct Connection (No Options)',
      options: {}
    },
    {
      name: 'Basic Connection',
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000
      }
    },
    {
      name: 'Minimal SSL Connection',
      options: {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        ssl: true,
        retryWrites: true
      }
    }
  ]
  
  for (const strategy of strategies) {
    console.log(`🧪 Testing: ${strategy.name}`)
    console.log('Options:', JSON.stringify(strategy.options, null, 2))
    
    try {
      const client = new MongoClient(uri, strategy.options)
      
      // Test connection with timeout
      const connectPromise = client.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
      console.log('✅ Connection successful')
      
      // Test ping
      try {
        await client.db().admin().ping()
        console.log('✅ Ping successful')
        
        // Test database access
        const db = client.db()
        const collections = await db.listCollections().toArray()
        console.log(`✅ Database access successful (${collections.length} collections)`)
        
        await client.close()
        console.log('✅ Connection closed successfully')
        console.log(`🎉 ${strategy.name} - WORKING!\n`)
        return true
        
      } catch (pingError) {
        console.log('❌ Ping failed:', pingError.message)
        await client.close()
      }
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message)
      
      // Provide specific error guidance
      if (error.message.includes('ENOTFOUND')) {
        console.log('💡 DNS resolution failed - check internet connection')
      } else if (error.message.includes('timeout')) {
        console.log('💡 Connection timeout - try different network or check firewall')
      } else if (error.message.includes('authentication')) {
        console.log('💡 Authentication failed - check username/password')
      }
    }
    console.log('')
  }
  
  console.log('❌ All connection strategies failed')
  console.log('')
  console.log('🔧 Troubleshooting Steps:')
  console.log('1. Check internet connection')
  console.log('2. Verify MongoDB Atlas cluster is running')
  console.log('3. Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for testing)')
  console.log('4. Verify credentials are correct')
  console.log('5. Try connecting from MongoDB Compass')
  console.log('')
  
  return false
}

async function testFallbackDatabase() {
  console.log('🔄 Testing Fallback Database...')
  
  try {
    // Import fallback function
    const { connectToDatabaseWithFallback } = require('../lib/mongodb-fallback')
    
    const connection = await connectToDatabaseWithFallback()
    console.log('✅ Fallback database connection successful')
    
    // Test basic operations
    const testDoc = { test: true, timestamp: new Date() }
    await connection.db.collection('test').insertOne(testDoc)
    console.log('✅ Fallback database write test successful')
    
    const result = await connection.db.collection('test').findOne({ test: true })
    console.log('✅ Fallback database read test successful')
    
    return true
  } catch (error) {
    console.log('❌ Fallback database failed:', error.message)
    return false
  }
}

async function main() {
  const atlasWorking = await diagnoseConnection()
  
  if (!atlasWorking) {
    console.log('🔄 Atlas connection failed, testing fallback...')
    const fallbackWorking = await testFallbackDatabase()
    
    if (fallbackWorking) {
      console.log('✅ Fallback database is working - system will use in-memory database')
      console.log('📝 Note: Data will not persist between server restarts')
    } else {
      console.log('❌ Both Atlas and fallback databases failed')
    }
  } else {
    console.log('🎉 MongoDB Atlas connection is working perfectly!')
  }
}

main().catch(console.error)