const { MongoClient } = require('mongodb')
require('dotenv').config()

async function fixMongoDBConnection() {
  console.log('🔧 MongoDB Connection Fix Tool')
  console.log('==============================\n')
  
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
  }
  
  console.log('🔍 Analyzing connection string...')
  console.log('Original URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'))
  console.log('')
  
  // Try different connection approaches
  const connectionStrategies = [
    {
      name: 'Standard Connection',
      uri: uri,
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      }
    },
    {
      name: 'Alternative DNS',
      uri: uri.replace('techlife.yonsh1a.mongodb.net', 'cluster0.yonsh1a.mongodb.net'),
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      }
    },
    {
      name: 'Direct IP Connection (if available)',
      uri: uri.replace('+srv', '').replace('techlife.yonsh1a.mongodb.net', 'ac-4onth1d-shard-00-00.yonsh1a.mongodb.net:27017,ac-4onth1d-shard-00-01.yonsh1a.mongodb.net:27017,ac-4onth1d-shard-00-02.yonsh1a.mongodb.net:27017'),
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        replicaSet: 'atlas-jvmc6k-shard-0'
      }
    }
  ]
  
  for (const strategy of connectionStrategies) {
    console.log(`🧪 Testing: ${strategy.name}`)
    console.log(`URI: ${strategy.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`)
    
    try {
      const client = new MongoClient(strategy.uri, strategy.options)
      await client.connect()
      await client.db().admin().ping()
      await client.close()
      
      console.log(`✅ ${strategy.name} - SUCCESS!`)
      console.log(`\n🎉 Working connection found!`)
      console.log(`\nUpdate your .env file with this URI:`)
      console.log(`MONGODB_URI=${strategy.uri}`)
      console.log('')
      return strategy.uri
    } catch (error) {
      console.log(`❌ ${strategy.name} - FAILED: ${error.message}`)
    }
    console.log('')
  }
  
  console.log('❌ All connection strategies failed.')
  console.log('')
  console.log('🔧 Possible Solutions:')
  console.log('')
  console.log('1. 🌐 Network Issues:')
  console.log('   - Check your internet connection')
  console.log('   - Try connecting from a different network')
  console.log('   - Check if your ISP blocks MongoDB ports')
  console.log('')
  console.log('2. 🔒 MongoDB Atlas Configuration:')
  console.log('   - Verify your cluster is running')
  console.log('   - Check IP whitelist (add 0.0.0.0/0 for testing)')
  console.log('   - Verify database user credentials')
  console.log('   - Check if cluster is paused')
  console.log('')
  console.log('3. 🔥 Firewall Issues:')
  console.log('   - Check corporate/local firewall settings')
  console.log('   - Ensure ports 27017 and 27015-27017 are open')
  console.log('   - Try connecting from a different location')
  console.log('')
  console.log('4. 🆔 DNS Issues:')
  console.log('   - Try using Google DNS (8.8.8.8, 8.8.4.4)')
  console.log('   - Flush DNS cache: sudo dscacheutil -flushcache (macOS)')
  console.log('   - Try connecting via mobile hotspot')
  console.log('')
  console.log('5. 🔄 Alternative Solutions:')
  console.log('   - Use MongoDB Compass to test connection')
  console.log('   - Try connecting from MongoDB Atlas web interface')
  console.log('   - Consider using a local MongoDB instance for development')
  console.log('')
  
  return null
}

async function createLocalFallback() {
  console.log('🏠 Setting up local MongoDB fallback...')
  console.log('')
  console.log('For development, you can use a local MongoDB instance:')
  console.log('')
  console.log('1. Install MongoDB locally:')
  console.log('   macOS: brew install mongodb-community')
  console.log('   Ubuntu: sudo apt install mongodb')
  console.log('   Windows: Download from mongodb.com')
  console.log('')
  console.log('2. Start MongoDB:')
  console.log('   macOS: brew services start mongodb-community')
  console.log('   Ubuntu: sudo systemctl start mongod')
  console.log('   Windows: net start MongoDB')
  console.log('')
  console.log('3. Update .env file:')
  console.log('   MONGODB_URI=mongodb://localhost:27017/aky-media')
  console.log('')
  console.log('4. Or use MongoDB Docker:')
  console.log('   docker run -d -p 27017:27017 --name mongodb mongo:latest')
  console.log('')
}

async function main() {
  const workingUri = await fixMongoDBConnection()
  
  if (!workingUri) {
    await createLocalFallback()
    
    console.log('📞 Need Help?')
    console.log('Contact your MongoDB Atlas administrator or:')
    console.log('- Check MongoDB Atlas status page')
    console.log('- Contact MongoDB support')
    console.log('- Use MongoDB community forums')
    console.log('')
    
    process.exit(1)
  }
}

main().catch(console.error)