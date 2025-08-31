import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create reusable transporter with comprehensive SMTP configuration
function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '587')
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465
  
  const config: any = {
    host: process.env.SMTP_HOST,
    port: port,
    secure: isSecure, // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
    // Additional options for better compatibility
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  }

  // Configure TLS settings based on port and provider
  if (!isSecure) {
    // For TLS (port 587)
    config.tls = {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  } else {
    // For SSL (port 465)
    config.tls = {
      rejectUnauthorized: false
    }
  }

  // Special configuration for common providers
  const host = process.env.SMTP_HOST?.toLowerCase()
  if (host?.includes('hostinger')) {
    config.tls = {
      rejectUnauthorized: false,
      servername: process.env.SMTP_HOST
    }
  } else if (host?.includes('gmail')) {
    config.service = 'gmail'
  } else if (host?.includes('outlook') || host?.includes('hotmail')) {
    config.service = 'hotmail'
  }

  return nodemailer.createTransport(config)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    // Validate test email
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Validate SMTP configuration
    const missingConfig = []
    if (!process.env.SMTP_HOST) missingConfig.push('SMTP_HOST')
    if (!process.env.SMTP_USER && !process.env.SMTP_USERNAME) missingConfig.push('SMTP_USER or SMTP_USERNAME')
    if (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD) missingConfig.push('SMTP_PASS or SMTP_PASSWORD')
    
    if (missingConfig.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service not configured properly',
          details: `Missing environment variables: ${missingConfig.join(', ')}`,
          configuration: {
            host: process.env.SMTP_HOST || 'Not set',
            port: process.env.SMTP_PORT || '587',
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not set'
          }
        },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Prepare sender information
    const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER
    const senderName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'AKY Communication System'
    const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail

    // Test connection first
    console.log('Testing SMTP connection for email test...')
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
          suggestions: {
            'EAUTH': 'Check username and password. For Gmail, use App Password.',
            'ECONNECTION': 'Check host and port settings',
            'ETIMEDOUT': 'Check firewall and network connectivity',
            'ENOTFOUND': 'Check SMTP host address',
            'ESOCKET': 'Try different port (587 for TLS, 465 for SSL)'
          }
        },
        { status: 503 }
      )
    }

    // Prepare test email content
    const currentTime = new Date().toLocaleString()
    const testSubject = `✅ Email Configuration Test - ${currentTime}`
    
    const testMessage = `Hello!

This is a test email from the AKY Communication System to verify your email configuration.

📧 Email Details:
• Sent at: ${currentTime}
• From: ${fromAddress}
• To: ${testEmail}
• SMTP Host: ${process.env.SMTP_HOST}
• SMTP Port: ${process.env.SMTP_PORT || '587'}
• Security: ${process.env.SMTP_SECURE === 'true' ? 'SSL' : 'TLS'}

✅ If you received this email, your email configuration is working correctly!

You can now use the email service to send:
• Notifications
• Newsletters
• Alerts
• Custom messages

Best regards,
AKY Communication Team

---
This is an automated test email from the AKY Communication Center.`

    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Configuration Test</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
        .badge { background: #007bff; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Email Configuration Test</h1>
        <p>AKY Communication System</p>
    </div>
    
    <div class="content">
        <div class="success">
            <strong>🎉 Success!</strong> Your email configuration is working correctly!
        </div>
        
        <p>Hello!</p>
        
        <p>This is a test email from the <strong>AKY Communication System</strong> to verify your email configuration.</p>
        
        <div class="info-box">
            <h3>📧 Email Configuration Details:</h3>
            <ul>
                <li><strong>Sent at:</strong> ${currentTime}</li>
                <li><strong>From:</strong> ${fromAddress}</li>
                <li><strong>To:</strong> ${testEmail}</li>
                <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</li>
                <li><strong>Security:</strong> <span class="badge">${process.env.SMTP_SECURE === 'true' ? 'SSL' : 'TLS'}</span></li>
            </ul>
        </div>
        
        <p>✅ If you received this email, your email configuration is working correctly!</p>
        
        <h3>🚀 What you can do now:</h3>
        <ul>
            <li>Send notifications to users</li>
            <li>Create email newsletters</li>
            <li>Send system alerts</li>
            <li>Send custom messages with HTML formatting</li>
            <li>Include attachments in your emails</li>
        </ul>
        
        <p><strong>Best regards,</strong><br>
        AKY Communication Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated test email from the AKY Communication Center.</p>
        <p>Generated at ${currentTime}</p>
    </div>
</body>
</html>`

    // Prepare email options
    const mailOptions = {
      from: fromAddress,
      to: testEmail,
      subject: testSubject,
      text: testMessage,
      html: htmlMessage,
      headers: {
        'X-Mailer': 'AKY Communication System - Test',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    }

    // Send test email
    console.log(`Sending test email to: ${testEmail}`)
    const info = await transporter.sendMail(mailOptions)

    console.log('Test email sent successfully:', {
      messageId: info.messageId,
      recipient: testEmail,
      from: fromAddress,
      accepted: info.accepted,
      rejected: info.rejected
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: info.messageId,
        recipient: testEmail,
        subject: testSubject,
        from: fromAddress,
        sentAt: new Date().toISOString(),
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        configuration: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || '587',
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not set'
        }
      },
      message: `Test email sent successfully to ${testEmail}. Check your inbox!`,
      instructions: [
        'Check your email inbox for the test message',
        'If you don\'t see it, check your spam/junk folder',
        'The email should arrive within a few minutes',
        'If you received it, your email configuration is working correctly!'
      ]
    })

  } catch (error: any) {
    console.error('Email test error:', error)

    // Handle specific nodemailer errors
    const errorHandling: { [key: string]: { message: string, details: string, status: number } } = {
      'EAUTH': {
        message: 'Email authentication failed',
        details: 'Invalid username or password. For Gmail, use App Password instead of regular password.',
        status: 401
      },
      'ECONNECTION': {
        message: 'Email server connection failed',
        details: 'Cannot connect to SMTP server. Check host, port, and firewall settings.',
        status: 503
      },
      'ETIMEDOUT': {
        message: 'Connection timeout',
        details: 'SMTP server took too long to respond. Check network connectivity.',
        status: 504
      },
      'ENOTFOUND': {
        message: 'SMTP server not found',
        details: 'Cannot resolve SMTP hostname. Check SMTP_HOST setting.',
        status: 502
      },
      'EENVELOPE': {
        message: 'Invalid email address',
        details: 'The test email address is invalid.',
        status: 400
      }
    }

    if (error.code && errorHandling[error.code]) {
      const errorInfo = errorHandling[error.code]
      return NextResponse.json(
        {
          success: false,
          error: errorInfo.message,
          details: errorInfo.details,
          code: error.code,
          troubleshooting: {
            gmail: 'Use App Password: https://support.google.com/accounts/answer/185833',
            outlook: 'Enable SMTP: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353',
            hostinger: 'Check your email credentials in cPanel',
            yahoo: 'Generate App Password: https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html'
          }
        },
        { status: errorInfo.status }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}