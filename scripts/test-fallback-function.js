// Test the updated fallback function
require('dotenv').config();
const path = require('path');

// Add the lib directory to module resolution
const libPath = path.join(__dirname, '..', 'lib');

async function testFallbackFunction() {
  console.log('🔍 Testing Updated Fallback Function...\n');
  
  try {
    // Dynamically import the function
    const mongodbFallback = await import(path.join(libPath, 'mongodb-fallback'));
    const { connectToDatabaseWithFallback } = mongodbFallback;
    
    console.log('🔄 Calling connectToDatabaseWithFallback()...');
    const startTime = Date.now();
    const connection = await connectToDatabaseWithFallback();
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Connection successful in ${totalTime}ms!`);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // Test ping
    console.log('📡 Testing ping...');
    const pingStart = Date.now();
    await connection.db.admin().ping();
    const pingTime = Date.now() - pingStart;
    console.log(`✅ Ping successful in ${pingTime}ms`);
    
    // Test database access
    console.log('🗄️  Testing database access...');
    const listStart = Date.now();
    const collections = await connection.db.listCollections().toArray();
    const listTime = Date.now() - listStart;
    console.log(`✅ Database accessible, found ${collections.length} collections in ${listTime}ms`);
    
    // Close connection
    await connection.client.close();
    console.log('🔌 Connection closed');
    
    console.log('\n🎉 Fallback function test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Fallback function test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testFallbackFunction().then(success => {
  if (success) {
    console.log('\n✅ Updated fallback function is working correctly!');
  } else {
    console.log('\n❌ Updated fallback function failed.');
  }
}).catch(console.error);
