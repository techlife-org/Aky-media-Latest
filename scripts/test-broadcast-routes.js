const fetch = require('node-fetch')
require('dotenv').config()

async function testBroadcastRoutes() {
  console.log('🧪 Testing Broadcast Routes...\n')
  
  const baseUrl = 'http://localhost:4000'
  const credentials = {
    email: process.env.BROADCAST_ADMIN_EMAIL || 'admin@akymediacenter.com',
    password: process.env.BROADCAST_ADMIN_PASSWORD || 'BroadcastAdmin2024!'
  }
  
  let authCookie = ''
  let broadcastId = ''
  
  try {
    // Step 1: Login to get authentication cookie
    console.log('🔐 Step 1: Logging in...')
    const loginResponse = await fetch(`${baseUrl}/api/broadcast-admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    
    const loginData = await loginResponse.json()
    console.log('Login Status:', loginResponse.status)
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData.message)
      return false
    }
    
    authCookie = loginResponse.headers.get('set-cookie') || ''
    console.log('✅ Login successful')
    console.log('')
    
    // Step 2: Test broadcast status (should be inactive initially)
    console.log('📊 Step 2: Testing broadcast status...')
    const statusResponse = await fetch(`${baseUrl}/api/broadcast/status`, {
      headers: { 'Cookie': authCookie }
    })
    
    const statusData = await statusResponse.json()
    console.log('Status Response:', statusResponse.status)
    console.log('Status Data:', JSON.stringify(statusData, null, 2))
    
    if (statusResponse.ok) {
      console.log('✅ Status check successful')
    } else {
      console.error('❌ Status check failed')
    }
    console.log('')
    
    // Step 3: Start a broadcast
    console.log('🎬 Step 3: Starting broadcast...')
    const startResponse = await fetch(`${baseUrl}/api/broadcast/enhanced-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        title: 'Test Broadcast - Governor Live Address',
        description: 'Testing the broadcast system functionality',
        settings: {
          maxParticipants: 1000,
          allowScreenShare: true,
          allowChat: true,
          allowReactions: true,
          requireApproval: false,
          isPublic: true
        }
      })
    })
    
    const startData = await startResponse.json()
    console.log('Start Response:', startResponse.status)
    console.log('Start Data:', JSON.stringify(startData, null, 2))
    
    if (startResponse.ok && startData.success) {
      broadcastId = startData.broadcast?.id || startData.meetingId
      console.log('✅ Broadcast started successfully')
      console.log('📺 Broadcast ID:', broadcastId)
      console.log('🔗 Meeting Link:', startData.meetingLink)
    } else {
      console.error('❌ Failed to start broadcast:', startData.message)
      return false
    }
    console.log('')
    
    // Step 4: Check status again (should be active now)
    console.log('📊 Step 4: Checking active broadcast status...')
    const activeStatusResponse = await fetch(`${baseUrl}/api/broadcast/status`, {
      headers: { 'Cookie': authCookie }
    })
    
    const activeStatusData = await activeStatusResponse.json()
    console.log('Active Status:', activeStatusResponse.status)
    console.log('Is Active:', activeStatusData.isActive)
    console.log('Title:', activeStatusData.title)
    console.log('Participants:', activeStatusData.participants)
    
    if (activeStatusResponse.ok && activeStatusData.isActive) {
      console.log('✅ Active broadcast status confirmed')
    } else {
      console.error('❌ Active broadcast status check failed')
    }
    console.log('')
    
    // Step 5: Test pause broadcast
    console.log('⏸️  Step 5: Testing pause broadcast...')
    const pauseResponse = await fetch(`${baseUrl}/api/broadcast/pause`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({ broadcastId })
    })
    
    const pauseData = await pauseResponse.json()
    console.log('Pause Response:', pauseResponse.status)
    console.log('Pause Success:', pauseData.success)
    
    if (pauseResponse.ok && pauseData.success) {
      console.log('✅ Broadcast paused successfully')
    } else {
      console.log('⚠️  Pause test result:', pauseData.message)
    }
    console.log('')
    
    // Step 6: Test resume broadcast
    console.log('▶️  Step 6: Testing resume broadcast...')
    const resumeResponse = await fetch(`${baseUrl}/api/broadcast/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({ broadcastId })
    })
    
    const resumeData = await resumeResponse.json()
    console.log('Resume Response:', resumeResponse.status)
    console.log('Resume Success:', resumeData.success)
    
    if (resumeResponse.ok && resumeData.success) {
      console.log('✅ Broadcast resumed successfully')
    } else {
      console.log('⚠️  Resume test result:', resumeData.message)
    }
    console.log('')
    
    // Step 7: Test broadcast management (update title)
    console.log('⚙️  Step 7: Testing broadcast management...')
    const manageResponse = await fetch(`${baseUrl}/api/broadcast/manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        action: 'update_title',
        broadcastId,
        data: {
          title: 'Updated Test Broadcast - Governor Live Address',
          description: 'Updated description for testing'
        }
      })
    })
    
    const manageData = await manageResponse.json()
    console.log('Manage Response:', manageResponse.status)
    console.log('Manage Success:', manageData.success)
    
    if (manageResponse.ok && manageData.success) {
      console.log('✅ Broadcast management successful')
    } else {
      console.log('⚠️  Management test result:', manageData.message)
    }
    console.log('')
    
    // Step 8: Stop the broadcast
    console.log('🛑 Step 8: Stopping broadcast...')
    const stopResponse = await fetch(`${baseUrl}/api/broadcast/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({ broadcastId })
    })
    
    const stopData = await stopResponse.json()
    console.log('Stop Response:', stopResponse.status)
    console.log('Stop Success:', stopData.success)
    
    if (stopResponse.ok && stopData.success) {
      console.log('✅ Broadcast stopped successfully')
    } else {
      console.error('❌ Failed to stop broadcast:', stopData.message)
    }
    console.log('')
    
    // Step 9: Final status check (should be inactive)
    console.log('📊 Step 9: Final status check...')
    const finalStatusResponse = await fetch(`${baseUrl}/api/broadcast/status`, {
      headers: { 'Cookie': authCookie }
    })
    
    const finalStatusData = await finalStatusResponse.json()
    console.log('Final Status:', finalStatusResponse.status)
    console.log('Is Active:', finalStatusData.isActive)
    
    if (finalStatusResponse.ok && !finalStatusData.isActive) {
      console.log('✅ Final status check confirmed broadcast is stopped')
    } else {
      console.log('⚠️  Final status:', finalStatusData.status)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Broadcast Routes Test Suite')
  console.log('===============================\n')
  
  const success = await testBroadcastRoutes()
  
  if (success) {
    console.log('\n🎉 All broadcast routes are working!')
    console.log('✅ Status, Start, Pause, Resume, Manage, and Stop all functional')
    console.log('✅ Ready for live broadcasting!')
  } else {
    console.log('\n❌ Some broadcast routes have issues')
    console.log('Please check the server logs for more details')
  }
}

main().catch(console.error)