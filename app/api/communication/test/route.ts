import { NextRequest, NextResponse } from 'next/server'

interface ServiceStatus {
  available: boolean
  status: string
  data?: any
  error?: string
}

interface CommunicationHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    whatsapp: 'up' | 'down' | 'degraded'
    sms: 'up' | 'down' | 'degraded'
    email: 'up' | 'down' | 'degraded'
  }
  lastChecked: string
}

// Function to check WhatsApp service
async function checkWhatsAppService(): Promise<ServiceStatus> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/whatsapp?action=status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    // WhatsApp service is available if:
    // 1. API responds successfully, AND
    // 2. Service is active (Termii WhatsApp API)
    const isAvailable = data.success && (
      data.status === 'active' || 
      data.status === 'configured' ||
      (data.account && data.account.apiStatus === 'connected') ||
      (data.health && data.health.status === 'ok')
    )
    
    return {
      available: isAvailable,
      status: data.status || 'available',
      data: data
    }
  } catch (error: any) {
    console.error('WhatsApp service check failed:', error)
    return {
      available: false,
      status: 'error',
      error: error.message
    }
  }
}

// Function to check SMS service
async function checkSMSService(): Promise<ServiceStatus> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/sms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    return {
      available: data.success && data.status === 'active',
      status: data.status || 'unknown',
      data: data
    }
  } catch (error: any) {
    console.error('SMS service check failed:', error)
    return {
      available: false,
      status: 'error',
      error: error.message
    }
  }
}

// Function to check Email service
async function checkEmailService(): Promise<ServiceStatus> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/email`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    // Email service is available if:
    // 1. API responds successfully, AND
    // 2. SMTP is configured and verified
    const isAvailable = data.success && (
      data.status === 'active' ||
      data.status === 'configured' ||
      (data.configuration && data.configuration.host && data.configuration.user)
    )
    
    return {
      available: isAvailable,
      status: data.status || 'configured',
      data: data
    }
  } catch (error: any) {
    console.error('Email service check failed:', error)
    return {
      available: false,
      status: 'error',
      error: error.message
    }
  }
}

// Function to calculate overall health
function calculateHealth(services: { [key: string]: ServiceStatus }): CommunicationHealth {
  const serviceStates = {
    whatsapp: services.whatsapp?.available ? 'up' : 'down',
    sms: services.sms?.available ? 'up' : 'down',
    email: services.email?.available ? 'up' : 'down'
  }
  
  const upCount = Object.values(serviceStates).filter(state => state === 'up').length
  
  let overall: 'healthy' | 'degraded' | 'unhealthy'
  if (upCount === 3) {
    overall = 'healthy'
  } else if (upCount >= 1) {
    overall = 'degraded'
  } else {
    overall = 'unhealthy'
  }
  
  return {
    overall,
    services: serviceStates as any,
    lastChecked: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Checking all communication services...')
    
    // Check all services in parallel
    const [whatsappStatus, smsStatus, emailStatus] = await Promise.all([
      checkWhatsAppService(),
      checkSMSService(),
      checkEmailService()
    ])
    
    const services = {
      whatsapp: whatsappStatus,
      sms: smsStatus,
      email: emailStatus
    }
    
    const health = calculateHealth(services)
    
    console.log('Service check results:', {
      whatsapp: whatsappStatus.available,
      sms: smsStatus.available,
      email: emailStatus.available,
      overall: health.overall
    })
    
    console.log('Detailed service status:', {
      whatsapp: {
        available: whatsappStatus.available,
        status: whatsappStatus.status,
        dataStatus: whatsappStatus.data?.status,
        clientAvailable: whatsappStatus.data?.clientAvailable,
        implementation: whatsappStatus.data?.implementation?.current
      },
      email: {
        available: emailStatus.available,
        status: emailStatus.status,
        dataStatus: emailStatus.data?.status,
        hasConfig: !!(emailStatus.data?.configuration?.host)
      }
    })
    
    return NextResponse.json({
      success: true,
      services,
      health,
      timestamp: new Date().toISOString(),
      summary: {
        total: 3,
        available: Object.values(services).filter(s => s.available).length,
        unavailable: Object.values(services).filter(s => !s.available).length
      }
    })
    
  } catch (error: any) {
    console.error('Communication test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check communication services',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, testData } = body
    
    console.log('Testing communication service:', service)
    
    if (service === 'all') {
      // Test all services with provided data
      const results: { [key: string]: any } = {}
      
      // Test WhatsApp if data provided
      if (testData?.whatsapp?.to && testData?.whatsapp?.message) {
        try {
          const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.whatsapp)
          })
          results.whatsapp = await whatsappResponse.json()
        } catch (error: any) {
          results.whatsapp = { success: false, error: error.message }
        }
      }
      
      // Test SMS if data provided
      if (testData?.sms?.to && testData?.sms?.message) {
        try {
          const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.sms)
          })
          results.sms = await smsResponse.json()
        } catch (error: any) {
          results.sms = { success: false, error: error.message }
        }
      }
      
      // Test Email if data provided
      if (testData?.email?.to && testData?.email?.subject) {
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/communication/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.email)
          })
          results.email = await emailResponse.json()
        } catch (error: any) {
          results.email = { success: false, error: error.message }
        }
      }
      
      const successCount = Object.values(results).filter((r: any) => r.success).length
      const totalCount = Object.keys(results).length
      
      return NextResponse.json({
        success: successCount > 0,
        results,
        summary: {
          tested: totalCount,
          successful: successCount,
          failed: totalCount - successCount
        },
        message: `Tested ${totalCount} service(s), ${successCount} successful`
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid test request' },
      { status: 400 }
    )
    
  } catch (error: any) {
    console.error('Communication test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test communication services',
        details: error.message
      },
      { status: 500 }
    )
  }
}