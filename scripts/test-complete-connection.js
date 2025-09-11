const fetch = require('node-fetch')
require('dotenv').config()

async function testCompleteConnection() {
  console.log('🔍 Complete Database Connection Test')
  console.log('====================================\n')
  
  const baseUrl = 'http://localhost:4000'
  
  // Test 1: Environment variables
  console.log('📋 Step 1: Environment Check')
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
  console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('')
  
  // Test 2: Direct MongoDB connection
  console.log('🔗 Step 2: Direct MongoDB Test')
  try {
    const { MongoClient } = require('mongodb')
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    await client.db().admin().ping()
    await client.close()
    console.log('✅ Direct MongoDB connection successful')
  } catch (error) {
    console.log('❌ Direct MongoDB connection failed:', error.message)
  }
  console.log('')
  
  // Test 3: Application MongoDB connection
  console.log('🔧 Step 3: Application MongoDB Connection')
  try {
    const { connectToDatabase } = require('../lib/mongodb')
    const { client, db } = await connectToDatabase()
    await db.admin().ping()
    console.log('✅ Application MongoDB connection successful')
  } catch (error) {
    console.log('❌ Application MongoDB connection failed:', error.message)
  }
  console.log('')
  
  // Test 4: Fallback database
  console.log('🔄 Step 4: Fallback Database Test')
  try {
    const { connectToDatabaseWithFallback } = require('../lib/mongodb-fallback')
    const connection = await connectToDatabaseWithFallback()
    
    // Test basic operations
    const testDoc = { test: true, timestamp: new Date() }
    await connection.db.collection('test').insertOne(testDoc)
    const result = await connection.db.collection('test').findOne({ test: true })
    
    console.log('✅ Fallback database working')
    console.log('✅ Fallback CRUD operations successful')
  } catch (error) {
    console.log('❌ Fallback database failed:', error.message)
  }
  console.log('')
  
  // Test 5: API Endpoints
  console.log('🌐 Step 5: API Endpoints Test')
  const endpoints = [
    { name: 'Broadcast Status', url: '/api/broadcast/status', method: 'GET' },
    { name: 'Chat History', url: '/api/broadcast/chat?meetingId=test', method: 'GET' },
    { 
      name: 'Join Broadcast', 
      url: '/api/broadcast/join', 
      method: 'POST',
      body: { meetingId: 'test', userName: 'Test User' }
    }
  ]
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now()
      
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      }
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body)
      }
      
      const response = await fetch(`${baseUrl}${endpoint.url}`, options)
      const endTime = Date.now()
      const data = await response.json()
      
      console.log(`📊 ${endpoint.name}:`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Time: ${endTime - startTime}ms`)
      console.log(`   Success: ${data.success !== false ? 'Yes' : 'No'}`)
      
      if (data.health) {
        console.log(`   Health: ${JSON.stringify(data.health)}`)
      }
      
      if (!response.ok || data.success === false) {
        console.log(`   Error: ${data.message || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`)
    }
    console.log('')
  }
  
  // Test 6: Authentication endpoints
  console.log('🔐 Step 6: Authentication Test')
  try {
    const loginResponse = await fetch(`${baseUrl}/api/broadcast-admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com',
        password: process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('📊 Admin Login:')
    console.log(`   Status: ${loginResponse.status}`)
    console.log(`   Success: ${loginData.success ? 'Yes' : 'No'}`)
    
    if (loginData.success) {
      console.log('✅ Authentication system working')
    } else {
      console.log(`   Error: ${loginData.message}`)
    }
    
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`)
  }
  console.log('')
  
  console.log('🎯 Test Summary:')
  console.log('================')
  console.log('If all tests show ✅, your database connection is working perfectly!')
  console.log('If some tests show ❌, check the specific error messages above.')
  console.log('')
  console.log('🔧 Common Solutions:')
  console.log('- Restart the development server: npm run dev')
  console.log('- Check internet connection')
  console.log('- Verify MongoDB Atlas cluster is running')
  console.log('- Check IP whitelist in MongoDB Atlas')
}

async function main() {
  try {
    await testCompleteConnection()
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
  }
}

main().catch(console.error)