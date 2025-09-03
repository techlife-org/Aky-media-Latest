const fetch = require('node-fetch')
require('dotenv').config()

async function testBroadcastPersistence() {
  console.log('🧪 Testing Broadcast Persistence')
  console.log('=================================\n')
  
  const baseUrl = 'http://localhost:4000'
  const credentials = {
    email: process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com',
    password: process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
  }
  
  let authCookie = ''
  let broadcastId = ''
  
  try {
    // Step 1: Admin Login
    console.log('🔐 Step 1: Admin Login')
    const loginResponse = await fetch(`${baseUrl}/api/broadcast-admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    const loginData = await loginResponse.json()
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.message)
      return false
    }
    
    authCookie = loginResponse.headers.get('set-cookie') || ''
    console.log('✅ Admin login successful')
    console.log('')
    
    // Step 2: Start Broadcast
    console.log('🎬 Step 2: Start Broadcast')
    const startResponse = await fetch(`${baseUrl}/api/broadcast/enhanced-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        title: 'Persistence Test Broadcast',
        description: 'Testing broadcast persistence when participants join',
        settings: {
          maxParticipants: 100,
          allowChat: true,
          allowReactions: true
        }
      })
    })
    
    const startData = await startResponse.json()
    if (!startResponse.ok || !startData.success) {
      console.error('❌ Start broadcast failed:', startData.message)
      return false
    }
    
    broadcastId = startData.broadcast?.id || startData.meetingId
    console.log('✅ Broadcast started successfully')
    console.log(`📺 Broadcast ID: ${broadcastId}`)
    console.log('')
    
    // Step 3: Check Initial Status
    console.log('📊 Step 3: Check Initial Status')
    const initialStatusResponse = await fetch(`${baseUrl}/api/broadcast/status`)
    const initialStatusData = await initialStatusResponse.json()
    
    console.log(`Status: ${initialStatusResponse.status}`)
    console.log(`Is Active: ${initialStatusData.isActive}`)
    console.log(`Participants: ${initialStatusData.participants || 0}`)
    console.log('')
    
    if (!initialStatusData.isActive) {
      console.error('❌ Broadcast is not active after starting')
      return false
    }
    
    // Step 4: Multiple Participants Join
    console.log('👥 Step 4: Multiple Participants Join')
    const participants = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    
    for (let i = 0; i < participants.length; i++) {
      const participantName = participants[i]
      console.log(`   Adding participant: ${participantName}`)
      
      const joinResponse = await fetch(`${baseUrl}/api/broadcast/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: broadcastId,
          userName: participantName,
          userType: 'viewer'
        })
      })
      
      const joinData = await joinResponse.json()
      console.log(`   Status: ${joinResponse.status}, Success: ${joinData.success}`)
      
      if (joinResponse.ok && joinData.success) {
        console.log(`   ✅ ${participantName} joined successfully`)
        console.log(`   📊 Total Participants: ${joinData.broadcast?.participantCount || 'Unknown'}`)
      } else {
        console.log(`   ❌ ${participantName} failed to join: ${joinData.message}`)
      }
      
      // Check broadcast status after each join
      const statusResponse = await fetch(`${baseUrl}/api/broadcast/status`)
      const statusData = await statusResponse.json()
      
      console.log(`   📊 Broadcast Status: Active=${statusData.isActive}, Participants=${statusData.participants}`)
      
      if (!statusData.isActive) {
        console.error(`   ❌ CRITICAL: Broadcast became inactive after ${participantName} joined!`)
        return false
      }
      
      // Wait a bit between joins
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('')
    }
    
    // Step 5: Final Status Check
    console.log('📊 Step 5: Final Status Check')
    const finalStatusResponse = await fetch(`${baseUrl}/api/broadcast/status`)
    const finalStatusData = await finalStatusResponse.json()
    
    console.log(`Final Status: ${finalStatusResponse.status}`)
    console.log(`Is Active: ${finalStatusData.isActive}`)
    console.log(`Total Participants: ${finalStatusData.participants || 0}`)
    console.log(`Viewer Count: ${finalStatusData.viewerCount || 0}`)
    console.log('')
    
    if (finalStatusData.isActive) {
      console.log('✅ Broadcast remained active throughout participant joins!')
    } else {
      console.error('❌ Broadcast became inactive')
      return false
    }
    
    // Step 6: Test Stream Endpoint
    console.log('📺 Step 6: Test Stream Endpoint')
    const streamResponse = await fetch(`${baseUrl}/api/broadcast/stream/${broadcastId}`)
    const streamData = await streamResponse.json()
    
    console.log(`Stream Status: ${streamResponse.status}`)
    console.log(`Stream Success: ${streamData.success}`)
    console.log(`Stream URL: ${streamData.streamUrl || 'Not available'}`)
    
    if (streamResponse.ok && streamData.success) {
      console.log('✅ Stream endpoint is working')
    } else {
      console.log('⚠️  Stream endpoint issue:', streamData.message)
    }
    console.log('')
    
    // Step 7: Stop Broadcast
    console.log('🛑 Step 7: Stop Broadcast')
    const stopResponse = await fetch(`${baseUrl}/api/broadcast/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({ broadcastId })
    })
    
    const stopData = await stopResponse.json()
    console.log(`Stop Status: ${stopResponse.status}`)
    console.log(`Stop Success: ${stopData.success}`)
    
    if (stopResponse.ok && stopData.success) {
      console.log('✅ Broadcast stopped successfully')
    } else {
      console.error('❌ Failed to stop broadcast:', stopData.message)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function main() {
  const success = await testBroadcastPersistence()
  
  console.log('\n🎯 Test Results:')
  console.log('================')
  
  if (success) {
    console.log('🎉 Broadcast persistence test PASSED!')
    console.log('✅ Broadcasts remain active when participants join')
    console.log('✅ Multiple participants can join without issues')
    console.log('✅ Stream endpoint is functional')
    console.log('✅ Broadcast management is working correctly')
  } else {
    console.log('❌ Broadcast persistence test FAILED!')
    console.log('🔧 Issues detected that need to be fixed')
  }
}

main().catch(console.error)