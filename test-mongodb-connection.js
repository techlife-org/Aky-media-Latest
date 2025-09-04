#!/usr/bin/env node

// Test script to verify MongoDB connection
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    // Import the connection function
    const { connectToDatabase } = require('./lib/mongodb.ts');
    
    console.log('⏳ Attempting to connect...');
    const { client, db } = await connectToDatabase();
    
    console.log('✅ Connected successfully!');
    
    // Test a simple operation
    const result = await db.admin().ping();
    console.log('✅ Ping successful:', result);
    
    // Test collections access
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.length);
    
    // Test broadcast collection
    const broadcastCount = await db.collection('broadcasts').countDocuments();
    console.log('📊 Broadcasts in database:', broadcastCount);
    
    console.log('🎉 All tests passed! MongoDB connection is working properly.');
    
    await client.close();
    console.log('🔒 Connection closed.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    process.exit(1);
  }
}

testConnection();