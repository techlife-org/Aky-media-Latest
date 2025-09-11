const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testCleanMongoDBConnection() {
  console.log('🔍 Testing Clean MongoDB Connection...\n');
  
  // Use a clean URI without extra parameters
  const baseUri = 'mongodb+srv://puffingroup:fKRoteTccn3d2Rtl@techlife.yonsh1a.mongodb.net/aky-media?retryWrites=true&w=majority&appName=techlife';
  
  console.log('📋 Base Connection URI:');
  console.log('URI:', baseUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
  console.log('');
  
  // Use more generous timeouts
  const options = {
    serverSelectionTimeoutMS: 15000, // 15 seconds
    connectTimeoutMS: 15000, // 15 seconds
    socketTimeoutMS: 30000, // 30 seconds
    retryWrites: true,
    retryReads: true,
    ssl: true,
    tls: true,
    appName: "techlife"
  };
  
  let client = null;
  
  try {
    console.log('🔄 Attempting connection with clean URI...');
    client = new MongoClient(baseUri, options);
    
    // Connect with reasonable timeout
    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Connected to MongoDB successfully in ${connectTime}ms!`);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const db = client.db();
    
    // Test ping
    console.log('📡 Testing ping...');
    const pingStart = Date.now();
    await db.admin().ping();
    const pingTime = Date.now() - pingStart;
    console.log(`✅ Ping successful in ${pingTime}ms`);
    
    // Test database access
    console.log('🗄️  Testing database access...');
    const listStart = Date.now();
    const collections = await db.listCollections().toArray();
    const listTime = Date.now() - listStart;
    console.log(`✅ Database accessible, found ${collections.length} collections in ${listTime}ms`);
    
    console.log('\n🎉 Clean MongoDB connection test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('💡 This might be a network or DNS issue. Try:');
      console.log('   1. Checking your internet connection');
      console.log('   2. Verifying the MongoDB Atlas cluster is running');
      console.log('   3. Ensuring your IP is whitelisted in MongoDB Atlas');
    } else if (error.name === 'MongoAuthenticationError') {
      console.log('💡 This might be an authentication issue. Try:');
      console.log('   1. Verifying your username and password');
      console.log('   2. Checking if the user has proper permissions');
    }
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

testCleanMongoDBConnection().then(success => {
  if (success) {
    console.log('\n✅ Clean MongoDB connection is working correctly!');
  } else {
    console.log('\n❌ Clean MongoDB connection failed.');
  }
}).catch(console.error);