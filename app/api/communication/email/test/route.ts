import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Simple test endpoint for email configuration
export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Validate SMTP configuration
    const missingConfig = []
    if (!process.env.SMTP_HOST) missingConfig.push('SMTP_HOST')
    if (!process.env.SMTP_USER && !process.env.SMTP_USERNAME) missingConfig.push('SMTP_USER')
    if (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD) missingConfig.push('SMTP_PASS')
    
    if (missingConfig.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing SMTP configuration',
          missing: missingConfig,
          current: {
            SMTP_HOST: process.env.SMTP_HOST || 'Not set',
            SMTP_PORT: process.env.SMTP_PORT || '587',
            SMTP_SECURE: process.env.SMTP_SECURE || 'false',
            SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not set'
          }
        },
        { status: 500 }
      )
    }

    // Create transporter with detailed logging
    const port = parseInt(process.env.SMTP_PORT || '587')
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465
    
    const config: any = {
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      debug: true, // Enable debug logging
      logger: true // Enable logger
    }

    // Configure TLS for different providers
    const host = process.env.SMTP_HOST?.toLowerCase()
    if (host?.includes('hostinger')) {
      config.tls = {
        rejectUnauthorized: false,
        servername: process.env.SMTP_HOST
      }
    } else if (host?.includes('gmail')) {
      config.service = 'gmail'
    } else if (!isSecure) {
      config.tls = {
        rejectUnauthorized: false
      }
    }

    console.log('Test Email Configuration:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      service: config.service || 'custom',
      user: config.auth.user?.substring(0, 3) + '***',
      hasPassword: !!config.auth.pass
    })

    const transporter = nodemailer.createTransport(config)

    // Step 1: Verify connection
    console.log('Step 1: Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError: any) {
      console.error('❌ SMTP verification failed:', verifyError)
      return NextResponse.json(
        {
          success: false,
          step: 'verification',
          error: 'SMTP connection failed',
          details: verifyError.message,
          code: verifyError.code,
          config: {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.auth.user?.substring(0, 3) + '***'
          },
          suggestions: {
            'EAUTH': 'Check username and password',
            'ECONNECTION': 'Check host and port settings',
            'ETIMEDOUT': 'Check firewall and network connectivity',
            'ENOTFOUND': 'Check SMTP host address',
            'ESOCKET': 'Try different port (587 for TLS, 465 for SSL)'
          }
        },
        { status: 503 }
      )
    }

    // Step 2: Send test email
    console.log('Step 2: Sending test email...')
    const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER
    const senderName = process.env.EMAIL_FROM_NAME || 'AKY Communication Test'
    
    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: testEmail,
      subject: 'AKY Communication System - Test Email ✅',
      text: `Hello!

This is a test email from the AKY Communication System.

If you received this email, your SMTP configuration is working correctly!

Configuration Details:
- SMTP Host: ${config.host}
- SMTP Port: ${config.port}
- Secure: ${config.secure ? 'Yes (SSL)' : 'No (TLS)'}
- Sender: ${senderEmail}

Test sent at: ${new Date().toISOString()}

Best regards,
AKY Communication System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ AKY Communication System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Test Email Successful</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #28a745; margin-top: 0;">🎉 Congratulations!</h2>
            <p>Your SMTP configuration is working correctly. This test email was sent successfully from the AKY Communication System.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Configuration Details:</h3>
              <ul style="color: #6c757d;">
                <li><strong>SMTP Host:</strong> ${config.host}</li>
                <li><strong>SMTP Port:</strong> ${config.port}</li>
                <li><strong>Security:</strong> ${config.secure ? 'SSL (Secure)' : 'TLS (StartTLS)'}</li>
                <li><strong>Sender:</strong> ${senderEmail}</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
              You can now use the communication system to send emails, SMS, and WhatsApp messages.
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      data: {
        messageId: info.messageId,
        testEmail: testEmail,
        sender: senderEmail,
        configuration: {
          host: config.host,
          port: config.port,
          secure: config.secure,
          service: config.service || 'custom'
        },
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        sentAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Test email failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        step: 'sending',
        error: 'Failed to send test email',
        details: error.message,
        code: error.code,
        troubleshooting: {
          'EAUTH': 'Authentication failed - check username and password',
          'ECONNECTION': 'Connection failed - check host and port',
          'ETIMEDOUT': 'Connection timeout - check network and firewall',
          'ENOTFOUND': 'Host not found - check SMTP hostname',
          'ESOCKET': 'Socket error - try different port or security setting'
        }
      },
      { status: 500 }
    )
  }
}

// GET endpoint for configuration check
export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint ready',
    usage: 'POST with { "testEmail": "your-email@example.com" }',
    currentConfig: {
      host: process.env.SMTP_HOST || 'Not configured',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE || 'false',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not configured',
      hasPassword: !!(process.env.SMTP_PASS || process.env.SMTP_PASSWORD)
    }
  })
}