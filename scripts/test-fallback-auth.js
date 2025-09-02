const fetch = require('node-fetch')
require('dotenv').config()

async function testFallbackAuth() {
  console.log('🧪 Testing Fallback Authentication System...\n')
  
  const baseUrl = 'http://localhost:4000'
  const credentials = {
    email: process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com',
    password: process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
  }
  
  console.log('📧 Testing with credentials:')
  console.log('Email:', credentials.email)
  console.log('Password:', credentials.password)
  console.log('')
  
  try {
    // Test login
    console.log('🔐 Testing login...')
    const loginResponse = await fetch(`${baseUrl}/api/broadcast-admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    
    const loginData = await loginResponse.json()
    console.log('Login Status:', loginResponse.status)
    console.log('Login Response:', loginData)
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed')
      return false
    }
    
    // Extract cookies for verification
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('✅ Login successful, cookies:', cookies ? 'Set' : 'Not set')
    console.log('')
    
    // Test verification
    console.log('🔍 Testing verification...')
    const verifyResponse = await fetch(`${baseUrl}/api/broadcast-admin/auth/verify`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    const verifyData = await verifyResponse.json()
    console.log('Verify Status:', verifyResponse.status)
    console.log('Verify Response:', verifyData)
    
    if (verifyResponse.ok && verifyData.authenticated) {
      console.log('✅ Authentication verification successful!')
      console.log('Admin:', verifyData.admin?.name)
      return true
    } else {
      console.error('❌ Authentication verification failed')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Fallback Authentication Test')
  console.log('================================\n')
  
  const success = await testFallbackAuth()
  
  if (success) {
    console.log('\n🎉 Fallback authentication system is working!')
    console.log('✅ Login and verification both successful')
    console.log('✅ Ready for broadcast control access')
  } else {
    console.log('\n❌ Fallback authentication system has issues')
    console.log('Please check the server logs for more details')
  }
}

main().catch(console.error)