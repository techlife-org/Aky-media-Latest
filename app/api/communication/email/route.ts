import { NextRequest, NextResponse } from 'next/server'
const nodemailer = require('nodemailer')

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

// Enhanced transporter creation with better reliability
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
    // Enhanced options for better reliability
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    // Retry configuration
    retryDelay: 3000, // 3 seconds between retries
    maxRetries: 3,
    // Additional security options
    requireTLS: !isSecure, // Require TLS for non-SSL connections
    logger: process.env.NODE_ENV === 'development', // Enable logging in development
    debug: process.env.NODE_ENV === 'development'
  }

  // Configure TLS settings based on port and provider
  if (!isSecure) {
    // For TLS (port 587)
    config.tls = {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
      minVersion: 'TLSv1'
    }
  } else {
    // For SSL (port 465)
    config.tls = {
      rejectUnauthorized: false,
      minVersion: 'TLSv1'
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
    config.tls = {
      rejectUnauthorized: false
    }
  } else if (host?.includes('outlook') || host?.includes('hotmail')) {
    config.service = 'hotmail'
    config.tls = {
      rejectUnauthorized: false
    }
  } else if (host?.includes('yahoo')) {
    config.service = 'yahoo'
    config.tls = {
      rejectUnauthorized: false
    }
  }

  // Log configuration for debugging (without sensitive data)
  console.log('Enhanced SMTP Configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    service: config.service || 'custom',
    user: config.auth.user ? config.auth.user.substring(0, 3) + '***' : 'Not set',
    hasPassword: !!config.auth.pass,
    tlsConfig: config.tls ? 'configured' : 'default',
    pooling: config.pool,
    retries: config.maxRetries
  })

  return nodemailer.createTransport(config)
}

// Enhanced email sending with retry logic
async function sendEmailWithRetry(transporter: any, mailOptions: any, maxRetries = 3): Promise<any> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Email sending attempt ${attempt}/${maxRetries}`)
      
      // Test connection before sending (only on first attempt)
      if (attempt === 1) {
        console.log('Testing SMTP connection...')
        await transporter.verify()
        console.log('✅ SMTP connection verified successfully')
      }
      
      // Send email
      const info = await transporter.sendMail(mailOptions)
      console.log(`✅ Email sent successfully on attempt ${attempt}`)
      return info
      
    } catch (error: any) {
      lastError = error
      console.error(`❌ Email sending failed on attempt ${attempt}:`, error.message)
      
      // Don't retry on authentication errors
      if (error.code === 'EAUTH') {
        throw error
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        const delay = attempt * 2000 // Exponential backoff: 2s, 4s, 6s
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
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
          setup: {
            provider: 'Enhanced SMTP Service',
            gmail: {
              SMTP_HOST: 'smtp.gmail.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              SMTP_USER: 'your-email@gmail.com',
              SMTP_PASS: 'your-app-password',
              note: 'Use App Password from Google Account settings'
            },
            outlook: {
              SMTP_HOST: 'smtp-mail.outlook.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              SMTP_USER: 'your-email@outlook.com',
              SMTP_PASS: 'your-password'
            },
            yahoo: {
              SMTP_HOST: 'smtp.mail.yahoo.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              SMTP_USER: 'your-email@yahoo.com',
              SMTP_PASS: 'your-app-password'
            },
            hostinger: {
              SMTP_HOST: 'smtp.hostinger.com',
              SMTP_PORT: '465',
              SMTP_SECURE: 'true',
              SMTP_USER: 'your-email@yourdomain.com',
              SMTP_PASS: 'your-email-password'
            }
          }
        },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Prepare sender information
    const senderEmail = from || process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER
    const senderName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'AKY Communication System'
    const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail

    // Prepare email options
    const mailOptions: any = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: message,
      // Enhanced headers for better deliverability
      headers: {
        'X-Mailer': 'AKY Communication System v3.0',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${senderEmail?.split('@')[1] || 'akymedia.com'}>`,
        'Date': new Date().toUTCString()
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

    // Send email with retry logic
    const info = await sendEmailWithRetry(transporter, mailOptions)

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipients: Array.isArray(to) ? to.length : 1,
      subject: subject,
      from: fromAddress,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
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
        envelope: info.envelope,
        provider: 'Enhanced SMTP Service'
      },
      message: `Email sent successfully to ${Array.isArray(to) ? to.length : 1} recipient(s)`
    })

  } catch (error: any) {
    console.error('Email sending error:', error)

    // Handle specific nodemailer errors with detailed troubleshooting
    const errorHandling: { [key: string]: { message: string, details: string, status: number, solutions: string[] } } = {
      'EAUTH': {
        message: 'Email authentication failed',
        details: 'Invalid username or password. For Gmail, use App Password instead of regular password.',
        status: 401,
        solutions: [
          'For Gmail: Generate App Password at https://support.google.com/accounts/answer/185833',
          'For Outlook: Enable SMTP in account settings',
          'For Yahoo: Generate App Password in security settings',
          'Verify username and password are correct'
        ]
      },
      'ECONNECTION': {
        message: 'Email server connection failed',
        details: 'Cannot connect to SMTP server. Check host, port, and firewall settings.',
        status: 503,
        solutions: [
          'Verify SMTP_HOST is correct',
          'Check SMTP_PORT (587 for TLS, 465 for SSL)',
          'Ensure firewall allows SMTP traffic',
          'Try different port if current one fails'
        ]
      },
      'ETIMEDOUT': {
        message: 'Connection timeout',
        details: 'SMTP server took too long to respond. Check network connectivity.',
        status: 504,
        solutions: [
          'Check internet connection',
          'Try again in a few minutes',
          'Contact your email provider',
          'Check if SMTP server is overloaded'
        ]
      },
      'ENOTFOUND': {
        message: 'SMTP server not found',
        details: 'Cannot resolve SMTP hostname. Check SMTP_HOST setting.',
        status: 502,
        solutions: [
          'Verify SMTP_HOST spelling',
          'Check DNS resolution',
          'Try using IP address instead of hostname',
          'Contact your email provider for correct SMTP settings'
        ]
      },
      'EENVELOPE': {
        message: 'Invalid email address',
        details: 'One or more email addresses are invalid.',
        status: 400,
        solutions: [
          'Check email address format',
          'Remove invalid characters',
          'Verify all recipients exist',
          'Check for typos in email addresses'
        ]
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
          solutions: errorInfo.solutions,
          provider: 'Enhanced SMTP Service',
          troubleshooting: {
            gmail: 'Use App Password: https://support.google.com/accounts/answer/185833',
            outlook: 'Enable SMTP: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353',
            yahoo: 'Generate App Password: https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html',
            hostinger: 'Use domain email credentials from hosting panel'
          }
        },
        { status: errorInfo.status }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: error.message,
        code: error.code,
        provider: 'Enhanced SMTP Service'
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
          service: 'Email (Enhanced SMTP)',
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
          providers: {
            gmail: {
              SMTP_HOST: 'smtp.gmail.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              note: 'Use App Password, not regular password'
            },
            outlook: {
              SMTP_HOST: 'smtp-mail.outlook.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              note: 'Regular password usually works'
            },
            yahoo: {
              SMTP_HOST: 'smtp.mail.yahoo.com',
              SMTP_PORT: '587',
              SMTP_SECURE: 'false',
              note: 'Generate App Password in security settings'
            },
            hostinger: {
              SMTP_HOST: 'smtp.hostinger.com',
              SMTP_PORT: '465',
              SMTP_SECURE: 'true',
              note: 'Use domain email credentials'
            }
          }
        },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Verify SMTP connection with enhanced testing
    const startTime = Date.now()
    await transporter.verify()
    const connectionTime = Date.now() - startTime

    // Determine provider type
    const host = config.host?.toLowerCase()
    let providerType = 'Custom SMTP'
    if (host?.includes('gmail')) providerType = 'Gmail'
    else if (host?.includes('outlook') || host?.includes('hotmail')) providerType = 'Outlook'
    else if (host?.includes('yahoo')) providerType = 'Yahoo'
    else if (host?.includes('hostinger')) providerType = 'Hostinger'

    return NextResponse.json({
      success: true,
      service: 'Email (Enhanced SMTP)',
      status: 'active',
      provider: providerType,
      configuration: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user ? config.user.substring(0, 3) + '***' : 'Not set',
        from: config.from || config.user,
        fromName: config.fromName || 'AKY Communication System'
      },
      performance: {
        connectionTime: `${connectionTime}ms`,
        status: connectionTime < 3000 ? 'excellent' : connectionTime < 5000 ? 'good' : connectionTime < 10000 ? 'fair' : 'slow'
      },
      features: {
        htmlEmails: true,
        attachments: true,
        multipleRecipients: true,
        ccBccSupport: true,
        retryMechanism: true,
        connectionPooling: true,
        enhancedSecurity: true,
        deliverabilityHeaders: true
      },
      limits: {
        gmail: '500 emails/day (free), 2000/day (paid)',
        outlook: '300 emails/day (free), 10000/day (paid)',
        yahoo: '500 emails/day',
        hostinger: 'Varies by hosting plan'
      },
      message: `Enhanced email service is ready and verified (${connectionTime}ms response)`
    })

  } catch (error: any) {
    console.error('Email service check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        service: 'Email (Enhanced SMTP)',
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
          'ENOTFOUND': 'Invalid SMTP hostname.',
          'general': 'Verify all SMTP settings and try again'
        },
        solutions: [
          'Verify SMTP credentials are correct',
          'Check firewall and network settings',
          'Try different SMTP port (587 or 465)',
          'Contact your email provider for support'
        ]
      },
      { status: 500 }
    )
  }
}