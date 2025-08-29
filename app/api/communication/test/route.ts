import { NextRequest, NextResponse } from 'next/server'

interface TestRequest {
  service: 'whatsapp' | 'sms' | 'email' | 'all'
  testData: {
    whatsapp?: {
      to: string
      message?: string
      templateSid?: string
      templateVariables?: string
    }
    sms?: {
      to: string | string[]
      message: string
      type?: 'single' | 'bulk'
    }
    email?: {
      to: string | string[]
      subject: string
      message: string
      html?: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TestRequest = await request.json()
    const { service, testData } = body

    const results: any = {
      timestamp: new Date().toISOString(),
      service: service,
      results: {}
    }

    // Test WhatsApp service
    if (service === 'whatsapp' || service === 'all') {
      if (testData.whatsapp) {
        try {
          const whatsappResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/communication/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.whatsapp)
          })
          
          const whatsappResult = await whatsappResponse.json()
          results.results.whatsapp = {
            success: whatsappResponse.ok,
            status: whatsappResponse.status,
            data: whatsappResult
          }
        } catch (error: any) {
          results.results.whatsapp = {
            success: false,
            error: error.message
          }
        }
      } else if (service === 'whatsapp') {
        return NextResponse.json(
          { success: false, error: 'WhatsApp test data is required' },
          { status: 400 }
        )
      }
    }

    // Test SMS service
    if (service === 'sms' || service === 'all') {
      if (testData.sms) {
        try {
          const smsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/communication/sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.sms)
          })
          
          const smsResult = await smsResponse.json()
          results.results.sms = {
            success: smsResponse.ok,
            status: smsResponse.status,
            data: smsResult
          }
        } catch (error: any) {
          results.results.sms = {
            success: false,
            error: error.message
          }
        }
      } else if (service === 'sms') {
        return NextResponse.json(
          { success: false, error: 'SMS test data is required' },
          { status: 400 }
        )
      }
    }

    // Test Email service
    if (service === 'email' || service === 'all') {
      if (testData.email) {
        try {
          const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/communication/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData.email)
          })
          
          const emailResult = await emailResponse.json()
          results.results.email = {
            success: emailResponse.ok,
            status: emailResponse.status,
            data: emailResult
          }
        } catch (error: any) {
          results.results.email = {
            success: false,
            error: error.message
          }
        }
      } else if (service === 'email') {
        return NextResponse.json(
          { success: false, error: 'Email test data is required' },
          { status: 400 }
        )
      }
    }

    // Calculate overall success
    const allResults = Object.values(results.results)
    const successCount = allResults.filter((result: any) => result.success).length
    const totalCount = allResults.length

    return NextResponse.json({
      success: successCount === totalCount,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      },
      ...results
    })

  } catch (error: any) {
    console.error('Communication test error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run communication tests',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check all services status
export async function GET() {
  try {
    const services = ['whatsapp', 'sms', 'email']
    const statusResults: any = {
      timestamp: new Date().toISOString(),
      services: {}
    }

    // Check each service status
    for (const service of services) {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/communication/${service}`, {
          method: 'GET'
        })
        
        const result = await response.json()
        statusResults.services[service] = {
          available: response.ok,
          status: response.status,
          data: result
        }
      } catch (error: any) {
        statusResults.services[service] = {
          available: false,
          error: error.message
        }
      }
    }

    // Calculate overall health
    const availableServices = Object.values(statusResults.services).filter((service: any) => service.available).length
    const totalServices = services.length

    return NextResponse.json({
      success: true,
      health: {
        overall: availableServices === totalServices ? 'healthy' : 'partial',
        available: availableServices,
        total: totalServices,
        percentage: Math.round((availableServices / totalServices) * 100)
      },
      ...statusResults
    })

  } catch (error: any) {
    console.error('Communication status check error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check communication services status',
        details: error.message
      },
      { status: 500 }
    )
  }
}