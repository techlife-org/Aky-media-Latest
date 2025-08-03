import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { connectToDatabase } from "@/lib/mongodb"
import path from 'path'

interface EmailData {
  to: string
  subject: string
  html: string
  type?: "new" | "reply"
  replyTo?: string
  recipientName?: string
}

// Email attachments configuration
const attachments = [
  {
    filename: 'akylogo.png',
    path: path.join(process.cwd(), 'public/pictures/logo.png'),
    cid: 'akylogo'
  },
  {
    filename: 'facebook.png',
    path: path.join(process.cwd(), 'public/pictures/facebook.png'),
    cid: 'facebookicon'
  },
  {
    filename: 'twitter.png',
    path: path.join(process.cwd(), 'public/pictures/x.png'),
    cid: 'twittericon'
  },
  {
    filename: 'instagram.png',
    path: path.join(process.cwd(), 'public/pictures/instagram.jpeg'),
    cid: 'instagramicon'
  }
];

// Enhanced email template with proper social media icons
function generateEmailHtml(content: string, recipientName: string, subject: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>${subject}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Base styles */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f8fafc;
          color: #333;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }
        
        .header-content {
          position: relative;
          z-index: 2;
          color: white;
        }
        
        .header-logo {
          max-width: 120px;
          height: auto;
          filter: brightness(0) invert(1);
          margin-bottom: 10px;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .content {
          padding: 40px 30px;
          background: white;
          line-height: 1.7;
          color: #4b5563;
        }
        
        .greeting {
          font-size: 18px;
          color: #111827;
          margin-bottom: 25px;
          font-weight: 500;
        }
        
        .message-content {
          margin: 25px 0;
          font-size: 16px;
          line-height: 1.7;
          color: #4b5563;
          background: #f9fafb;
          padding: 20px;
          border-left: 4px solid #dc2626;
          border-radius: 0 8px 8px 0;
        }
        
        .signature {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 15px;
        }
        
        .footer {
          padding: 30px 20px;
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-links {
          margin: 20px 0;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .footer-links a {
          color: #dc2626;
          text-decoration: none;
          transition: color 0.2s;
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .footer-links a:hover {
          color: #b91c1c;
          background-color: #fef2f2;
        }
        
        .social-links {
          margin: 30px auto;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          max-width: 400px;
          padding: 0 20px;
        }
        
        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .social-links a::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: 0.5s;
        }
        
        .social-links a:hover {
          background: #b91c1c;
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 6px 12px rgba(220, 38, 38, 0.25);
        }
        
        .social-links a:hover::before {
          left: 100%;
        }
        
        .social-links svg {
          width: 20px;
          height: 20px;
          position: relative;
          z-index: 1;
        }
        
        .footer-address {
          margin: 20px 0;
          line-height: 1.6;
          color: #6b7280;
        }
        
        .copyright {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #9ca3af;
          font-size: 13px;
        }
        
        .logo-fallback {
          width: 120px;
          height: 60px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #dc2626;
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            border-radius: 0 !important;
          }
          .content {
            padding: 25px 20px !important;
          }
          .header {
            height: 160px !important;
          }
          .header-logo, .logo-fallback {
            max-width: 100px !important;
          }
          .footer-links {
            flex-direction: column;
            gap: 10px;
          }
          .social-links {
            gap: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <img 
              src="${baseUrl}/pictures/logo.png" 
              alt="AKY Media Logo" 
              class="header-logo"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="logo-fallback" style="display: none;">
              AKY Media Center
            </div>
            <h1 class="header-title">AKY Media Center</h1>
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${recipientName || "Valued Contact"},</p>
          
          <div class="message-content">
            ${content.replace(/\n/g, "<br>")}
          </div>
          
          <div class="signature">
            <p><strong>Best regards,</strong></p>
            <p><strong>AKY Media Center</strong><br>
            Office of the Governor<br>
            Kano State Government<br>
            Nigeria</p>
            
            <p style="margin-top: 15px;">
              <strong>Contact Information:</strong><br>
              📧 Email: info@abbakabiryusuf.com<br>
              🌐 Website: www.abbakabiryusuf.com<br>
              📱 Phone: +234 123 456 7890
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/abbakabiryusuf" title="Facebook" target="_blank">
              <img src="cid:facebookicon" alt="Facebook" width="24" height="24" style="display: block; border: none; outline: none;">
            </a>
            <a href="https://twitter.com/abbakabiryusuf" title="Twitter/X" target="_blank">
              <img src="cid:twittericon" alt="Twitter" width="24" height="24" style="display: block; border: none; outline: none;">
            </a>
            <a href="https://instagram.com/abbakabiryusuf" title="Instagram" target="_blank">
              <img src="cid:instagramicon" alt="Instagram" width="24" height="24" style="display: block; border: none; outline: none;">
            </a>
          </div>
          
          <div class="footer-address">
            <p><strong>📍 Address:</strong><br>
            Kano State Government House<br>
            Kano, Nigeria</p>
          </div>
          
          <div class="footer-links">
            <a href="${baseUrl}">🏠 Home</a>
            <a href="${baseUrl}/about">👥 About Us</a>
            <a href="${baseUrl}/news">📰 News & Updates</a>
            <a href="${baseUrl}/contact">📞 Contact Us</a>
          </div>
          
          <div class="copyright">
            &copy; ${new Date().getFullYear()} AKY Media Center. All rights reserved.<br>
            <small>This email was sent from an official government communication system.</small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, type = "new", replyTo, recipientName } = (await request.json()) as EmailData

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, and html are required" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 })
    }

    // Generate the enhanced email template
    const emailHtml = generateEmailHtml(html, recipientName || "Valued Contact", subject)

    // Create transporter with better error handling
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    })

    // Verify transporter configuration
    await transporter.verify()

    // Send email with attachments
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "AKY Media Center"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: emailHtml,
      replyTo: replyTo || process.env.EMAIL_FROM || process.env.SMTP_USER,
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${process.env.EMAIL_DOMAIN || "abbakabiryusuf.com"}>`,
    //   attachments: attachments,
    })

    // Store sent email in database
    try {
      const { db } = await connectToDatabase()
      await db.collection("sent_emails").insertOne({
        to,
        subject,
        content: html,
        type,
        status: "sent",
        messageId: info.messageId,
        sentAt: new Date(),
        createdAt: new Date(),
      })
    } catch (dbError) {
      console.error("Failed to store sent email:", dbError)
      // Don't fail the request if database storage fails
    }

    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    })
  } catch (error) {
    console.error("Failed to send email:", error)

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("EAUTH")) {
        return NextResponse.json(
          { error: "Email authentication failed. Please check SMTP credentials." },
          { status: 500 },
        )
      }
      if (error.message.includes("ECONNECTION")) {
        return NextResponse.json(
          { error: "Failed to connect to email server. Please check SMTP settings." },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to send email",
        details:
          process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 },
    )
  }
}
