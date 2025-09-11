const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testDirectMongoDBConnection() {
  console.log('🔍 Testing Direct MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  console.log('📋 Connection Details:');
  console.log('URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
  console.log('');
  
  // Use the same options as in our updated fallback function
  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 20000, // 20 seconds
    retryWrites: true,
    retryReads: true,
    ssl: true,
    tls: true,
    appName: "techlife"
  };
  
  let client = null;
  
  try {
    console.log('🔄 Attempting connection...');
    client = new MongoClient(uri, options);
    
    // Connect with reasonable timeout
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const db = client.db();
    
    // Test ping
    console.log('📡 Testing ping...');
    await db.admin().ping();
    console.log('✅ Ping successful');
    
    // Test database access
    console.log('🗄️  Testing database access...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database accessible, found ${collections.length} collections`);
    
    console.log('\n🎉 Direct MongoDB connection test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 Connection closed');
      } catch (closeError) {
        console.warn('Warning: Error closing connection:', closeError.message);
      }
    }
  }
}

testDirectMongoDBConnection().then(success => {
  if (success) {
    console.log('\n✅ Direct MongoDB connection is working correctly!');
  } else {
    console.log('\n❌ Direct MongoDB connection failed.');
  }
}).catch(console.error);