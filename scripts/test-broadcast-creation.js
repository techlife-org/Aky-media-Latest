// Test creating a broadcast
const fetch = require('node-fetch');

async function testBroadcastCreation() {
  try {
    // First login
    console.log('🔐 Logging in as broadcast admin...');
    const loginResponse = await fetch('http://localhost:4000/api/broadcast-admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@akymediacenter.com',
        password: 'BroadcastAdmin2024!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    const authCookie = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful');
    
    // Start broadcast
    console.log('\n🎬 Starting broadcast...');
    const startResponse = await fetch('http://localhost:4000/api/broadcast/enhanced-start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        title: 'Test Broadcast Stream',
        description: 'Testing live stream functionality',
        settings: {
          maxParticipants: 100,
          allowChat: true,
          allowReactions: true
        }
      })
    });
    
    const startData = await startResponse.json();
    console.log('Start broadcast response:', startData);
    
    if (!startResponse.ok || !startData.success) {
      console.error('❌ Broadcast creation failed:', startData.message);
      return;
    }
    
    console.log('✅ Broadcast started successfully');
    console.log('Meeting ID:', startData.meetingId);
    console.log('Meeting Link:', startData.meetingLink);
    
    // Check broadcast status
    console.log('\n📊 Checking broadcast status...');
    const statusResponse = await fetch('http://localhost:4000/api/broadcast/status');
    const statusData = await statusResponse.json();
    console.log('Status:', statusData);
    
    if (statusData.isActive) {
      console.log('✅ Live stream is active and working!');
    } else {
      console.log('⚠️  Broadcast is not active yet');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBroadcastCreation();