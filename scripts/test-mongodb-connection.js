const { MongoClient } = require('mongodb')
require('dotenv').config()

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n')
  
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
  }
  
  console.log('📋 Connection Details:')
  console.log('URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')) // Hide credentials
  console.log('')
  
  // Enhanced connection options
  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    ssl: true,
    tls: true,
    appName: 'aky-media-center-test',
    heartbeatFrequencyMS: 10000,
    readPreference: 'primaryPreferred',
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 10000
    }
  }
  
  const maxRetries = 3
  let client = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${maxRetries}...`)
      
      client = new MongoClient(uri, options)
      
      // Connect with timeout
      const connectPromise = client.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
      
      console.log('✅ Connected to MongoDB successfully!')
      
      // Test database operations
      console.log('\n🧪 Testing database operations...')
      
      const db = client.db()
      
      // Test ping
      console.log('📡 Testing ping...')
      await db.admin().ping()
      console.log('✅ Ping successful')
      
      // Test database access
      console.log('🗄️  Testing database access...')
      const collections = await db.listCollections().toArray()
      console.log(`✅ Database accessible, found ${collections.length} collections`)
      
      // Test write operation
      console.log('✍️  Testing write operation...')
      const testCollection = db.collection('connection_test')
      const testDoc = { 
        test: true, 
        timestamp: new Date(),
        message: 'Connection test successful'
      }
      const insertResult = await testCollection.insertOne(testDoc)
      console.log('✅ Write operation successful, inserted ID:', insertResult.insertedId)
      
      // Test read operation
      console.log('📖 Testing read operation...')
      const readResult = await testCollection.findOne({ _id: insertResult.insertedId })
      console.log('✅ Read operation successful')
      
      // Cleanup test document
      console.log('🧹 Cleaning up test data...')
      await testCollection.deleteOne({ _id: insertResult.insertedId })
      console.log('✅ Cleanup successful')
      
      // Test connection info
      console.log('\n📊 Connection Information:')
      const admin = db.admin()
      try {
        const serverStatus = await admin.serverStatus()
        console.log('Server Version:', serverStatus.version)
        console.log('Host:', serverStatus.host)
        console.log('Uptime:', Math.floor(serverStatus.uptime / 3600), 'hours')
      } catch (statusError) {
        console.log('ℹ️  Could not retrieve server status (this is normal for some MongoDB configurations)')
      }
      
      console.log('\n🎉 All tests passed! MongoDB connection is working perfectly.')
      return true
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message)
      
      if (error.message.includes('timeout')) {
        console.log('💡 Suggestion: Check your internet connection and firewall settings')
      } else if (error.message.includes('authentication')) {
        console.log('💡 Suggestion: Verify your MongoDB credentials')
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        console.log('💡 Suggestion: Check your internet connection and DNS settings')
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(2000 * attempt, 5000)
        console.log(`⏳ Retrying in ${delay}ms...\n`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } finally {
      if (client) {
        try {
          await client.close()
        } catch (closeError) {
          console.warn('Warning: Error closing connection:', closeError.message)
        }
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed.')
  console.log('\n🔧 Troubleshooting Steps:')
  console.log('1. Check your internet connection')
  console.log('2. Verify MongoDB Atlas cluster is running')
  console.log('3. Check if your IP address is whitelisted in MongoDB Atlas')
  console.log('4. Verify the connection string and credentials')
  console.log('5. Try connecting from MongoDB Compass or mongo shell')
  console.log('6. Check if there are any firewall restrictions')
  
  return false
}

// Network diagnostics
async function runNetworkDiagnostics() {
  console.log('\n🌐 Running Network Diagnostics...')
  
  try {
    // Test DNS resolution
    const dns = require('dns').promises
    console.log('🔍 Testing DNS resolution...')
    const addresses = await dns.lookup('techlife.yonsh1a.mongodb.net')
    console.log('✅ DNS resolution successful:', addresses.address)
  } catch (dnsError) {
    console.error('❌ DNS resolution failed:', dnsError.message)
  }
  
  try {
    // Test basic connectivity
    const https = require('https')
    console.log('🔍 Testing HTTPS connectivity...')
    
    const testUrl = 'https://www.google.com'
    await new Promise((resolve, reject) => {
      const req = https.get(testUrl, (res) => {
        console.log('✅ HTTPS connectivity working')
        resolve(res)
      })
      req.on('error', reject)
      req.setTimeout(5000, () => reject(new Error('Request timeout')))
    })
  } catch (httpError) {
    console.error('❌ HTTPS connectivity failed:', httpError.message)
  }
}

async function main() {
  console.log('🚀 MongoDB Connection Diagnostics Tool')
  console.log('=====================================\n')
  
  await runNetworkDiagnostics()
  
  const success = await testMongoDBConnection()
  
  if (success) {
    console.log('\n✅ MongoDB connection is working correctly!')
    console.log('You can now use the broadcast admin system.')
  } else {
    console.log('\n❌ MongoDB connection failed.')
    console.log('Please resolve the connection issues before using the broadcast system.')
    process.exit(1)
  }
}

main().catch(console.error)