import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { connectToDatabase } from "@/lib/mongodb"

interface EmailData {
  to: string
  subject: string
  html: string
  type?: "new" | "reply"
  replyTo?: string
  recipientName?: string
}

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
          margin: 25px 0;
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        
        .social-links a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 16px;
          font-weight: bold;
        }
        
        .social-links a:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://twitter.com/abbakabiryusuf" title="Twitter/X" target="_blank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com/abbakabiryusuf" title="Instagram" target="_blank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/abbakabiryusuf" title="LinkedIn" target="_blank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@abbakabiryusuf" title="YouTube" target="_blank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
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

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "AKY Media Center"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: emailHtml,
      replyTo: replyTo || process.env.EMAIL_FROM || process.env.SMTP_USER,
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${process.env.EMAIL_DOMAIN || "abbakabiryusuf.com"}>`,
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
