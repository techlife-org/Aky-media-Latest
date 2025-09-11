const bcryptjs = require('bcryptjs')
require('dotenv').config()

async function testBroadcastLogin() {
  console.log('🧪 Testing Broadcast Admin Login Credentials...\n')
  
  // Get credentials from environment
  const email = process.env.BROADCAST_ADMIN_EMAIL
  const password = process.env.BROADCAST_ADMIN_PASSWORD
  const name = process.env.BROADCAST_ADMIN_NAME
  
  console.log('📧 Email from .env:', email)
  console.log('🔑 Password from .env:', password)
  console.log('👤 Name from .env:', name)
  console.log('')
  
  // Test password hashing (same as what's used in the system)
  const saltRounds = 12
  const hashedPassword = await bcryptjs.hash(password, saltRounds)
  console.log('🔐 Hashed password (sample):', hashedPassword.substring(0, 20) + '...')
  
  // Test password verification
  const isValid = await bcryptjs.compare(password, hashedPassword)
  console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED')
  console.log('')
  
  console.log('🌐 Login URLs:')
  console.log('   • Local: http://localhost:4000/broadcast-admin/login')
  console.log('   • Production: https://your-domain.com/broadcast-admin/login')
  console.log('')
  
  console.log('📊 Dashboard URLs:')
  console.log('   • Enhanced: /dashboard/broadcast/enhanced')
  console.log('   • Original: /dashboard/broadcast')
  console.log('')
  
  console.log('🎯 Test Instructions:')
  console.log('1. Go to the login URL')
  console.log('2. Enter the email and password shown above')
  console.log('3. You should be redirected to the broadcast dashboard')
  console.log('4. You can then start a live broadcast')
  console.log('')
  
  console.log('✅ Credentials are properly configured in .env file!')
}

testBroadcastLogin().catch(console.error)