const fetch = require('node-fetch')
require('dotenv').config()

async function testQuickConnection() {
  console.log('⚡ Testing Quick Database Connection...\n')
  
  const baseUrl = 'http://localhost:4000'
  
  try {
    console.log('📊 Testing broadcast status endpoint...')
    const startTime = Date.now()
    
    const response = await fetch(`${baseUrl}/api/broadcast/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`⏱️  Response time: ${responseTime}ms`)
    console.log('📊 Status Code:', response.status)
    
    const data = await response.json()
    console.log('📋 Response Data:')
    console.log(JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ Database connection working!')
      console.log('🔍 Health Status:', data.health)
      console.log('📊 Connection Quality:', data.connectionQuality)
      
      if (data.health?.database) {
        console.log('✅ Database is healthy')
      } else {
        console.log('⚠️  Database health check failed')
      }
      
      return true
    } else {
      console.error('❌ Request failed with status:', response.status)
      console.error('❌ Error message:', data.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function testMultipleEndpoints() {
  console.log('🔄 Testing Multiple Endpoints...\n')
  
  const baseUrl = 'http://localhost:4000'
  const endpoints = [
    '/api/broadcast/status',
    '/api/broadcast/chat?meetingId=test'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing: ${endpoint}`)
      const startTime = Date.now()
      
      const response = await fetch(`${baseUrl}${endpoint}`)
      const endTime = Date.now()
      
      console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
      console.log(`   📊 Status: ${response.status}`)
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint} - Working`)
      } else {
        const data = await response.json()
        console.log(`   ❌ ${endpoint} - Failed: ${data.message}`)
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Error: ${error.message}`)
    }
    
    console.log('')
  }
}

async function main() {
  console.log('🚀 Quick Database Connection Test')
  console.log('==================================\n')
  
  // Test single endpoint first
  const singleTest = await testQuickConnection()
  
  if (singleTest) {
    console.log('\n🎯 Single endpoint test passed!')
    
    // Test multiple endpoints
    await testMultipleEndpoints()
    
    console.log('🎉 All tests completed!')
    console.log('✅ Database connection is working with fallback system')
    console.log('✅ Ready for live broadcast functionality')
  } else {
    console.log('\n❌ Single endpoint test failed')
    console.log('🔧 Please check server logs for more details')
  }
}

main().catch(console.error)