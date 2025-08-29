import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailMessage {
  to: string | string[]
  subject: string
  message: string
  html?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    path?: string
    content?: string
    contentType?: string
  }>
}

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

  // Log configuration for debugging (without sensitive data)
  console.log('SMTP Configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    service: config.service || 'custom',
    user: config.auth.user ? config.auth.user.substring(0, 3) + '***' : 'Not set',
    hasPassword: !!config.auth.pass,
    tlsConfig: config.tls ? 'configured' : 'default'
  })

  return nodemailer.createTransport(config)
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailMessage = await request.json()
    const { to, subject, message, html, from, cc, bcc, attachments } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient email address(es) required' },
        { status: 400 }
      )
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Email subject is required' },
        { status: 400 }
      )
    }

    if (!message && !html) {
      return NextResponse.json(
        { success: false, error: 'Email message content is required' },
        { status: 400 }
      )
    }

    // Validate SMTP configuration with detailed error messages
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
          required: {
            SMTP_HOST: 'SMTP server hostname (e.g., smtp.gmail.com)',
            SMTP_PORT: 'SMTP port (587 for TLS, 465 for SSL, 25 for non-secure)',
            SMTP_SECURE: 'true for SSL (port 465), false for TLS (port 587)',
            SMTP_USER: 'SMTP username (usually your email)',
            SMTP_PASS: 'SMTP password or app password',
            SMTP_FROM: 'Default sender email address'
          }
        },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Prepare sender information
    const senderEmail = from || process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER
    const senderName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'AKY Communication'
    const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail

    // Prepare email options
    const mailOptions: any = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: message,
      // Add headers for better deliverability
      headers: {
        'X-Mailer': 'AKY Communication System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    }

    // Add HTML content if provided
    if (html) {
      mailOptions.html = html
    }

    // Add CC if provided
    if (cc) {
      mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc
    }

    // Add BCC if provided
    if (bcc) {
      mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments
    }

    // Test connection before sending
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error('SMTP verification failed:', verifyError)
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP connection failed',
          details: verifyError.message,
          troubleshooting: {
            'EAUTH': 'Check username and password',
            'ECONNECTION': 'Check host and port settings',
            'ETIMEDOUT': 'Check firewall and network connectivity',
            'ENOTFOUND': 'Check SMTP host address'
          }
        },
        { status: 503 }
      )
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipients: Array.isArray(to) ? to.length : 1,
      subject: subject,
      from: fromAddress,
      accepted: info.accepted,
      rejected: info.rejected
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: info.messageId,
        recipients: Array.isArray(to) ? to : [to],
        subject: subject,
        from: fromAddress,
        sentAt: new Date().toISOString(),
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        envelope: info.envelope
      },
      message: `Email sent successfully to ${Array.isArray(to) ? to.length : 1} recipient(s)`
    })

  } catch (error: any) {
    console.error('Email sending error:', error)

    // Handle specific nodemailer errors with detailed troubleshooting
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
        details: 'One or more email addresses are invalid.',
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
            yahoo: 'Generate App Password: https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html'
          }
        },
        { status: errorInfo.status }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check email service status with comprehensive diagnostics
export async function GET() {
  try {
    // Check configuration
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
      hasPassword: !!(process.env.SMTP_PASS || process.env.SMTP_PASSWORD),
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
      fromName: process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME
    }

    const missingConfig = []
    if (!config.host) missingConfig.push('SMTP_HOST')
    if (!config.user) missingConfig.push('SMTP_USER')
    if (!config.hasPassword) missingConfig.push('SMTP_PASS')

    if (missingConfig.length > 0) {
      return NextResponse.json(
        {
          success: false,
          service: 'Email (SMTP)',
          status: 'misconfigured',
          error: 'Missing required configuration',
          missing: missingConfig,
          configuration: {
            host: config.host || 'Not set',
            port: config.port,
            secure: config.secure,
            user: config.user ? config.user.substring(0, 3) + '***' : 'Not set',
            hasPassword: config.hasPassword,
            from: config.from || 'Not set'
          },
          examples: {
            gmail: {
              SMTP_HOST: 'smtp.gmail.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              SMTP_USER: 'your-email@gmail.com',
              SMTP_PASS: 'your-app-password'
            },
            outlook: {
              SMTP_HOST: 'smtp-mail.outlook.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              SMTP_USER: 'your-email@outlook.com',
              SMTP_PASS: 'your-password'
            }
          }
        },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Verify SMTP connection
    const startTime = Date.now()
    await transporter.verify()
    const connectionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      service: 'Email (SMTP)',
      status: 'active',
      configuration: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user ? config.user.substring(0, 3) + '***' : 'Not set',
        from: config.from || config.user,
        fromName: config.fromName || 'AKY Communication'
      },
      performance: {
        connectionTime: `${connectionTime}ms`,
        status: connectionTime < 5000 ? 'fast' : connectionTime < 10000 ? 'normal' : 'slow'
      },
      message: 'Email service is ready and verified'
    })

  } catch (error: any) {
    console.error('Email service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'Email (SMTP)',
        status: 'error',
        error: error.message,
        code: error.code,
        configuration: {
          host: process.env.SMTP_HOST || 'Not set',
          port: process.env.SMTP_PORT || '587',
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not set'
        },
        troubleshooting: {
          'EAUTH': 'Check username and password. For Gmail, use App Password.',
          'ECONNECTION': 'Check host and port. Ensure firewall allows SMTP.',
          'ETIMEDOUT': 'Network connectivity issue or server overload.',
          'ENOTFOUND': 'Invalid SMTP hostname.'
        }
      },
      { status: 500 }
    )
  }
}