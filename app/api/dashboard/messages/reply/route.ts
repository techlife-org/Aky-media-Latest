import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface EmailData {
  to: string
  subject: string
  html: string
  replyTo?: string
  recipientName?: string
}

// Enhanced email template with image header
function generateReplyEmailHtml(content: string, recipientName: string, subject: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"
  const logoUrl = `${baseUrl}/pictures/logo.png`
  const headerImageUrl = `${baseUrl}/pictures/email-header.jpg` // You can add this image to your public folder

  // Convert plain text to HTML with proper formatting
  const formattedContent = content
    .replace(/\n/g, "<br>") // Convert line breaks to HTML
    .replace(/----------------------------------------/g, '<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">') // Convert separator lines
    .replace(
      /Original message from (.*?):/g,
      '<p style="font-weight: bold; color: #374151;">Original message from $1:</p>',
    ) // Style original message header

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale: 1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>${subject}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 15px !important; }
          .button { display: block !important; width: 100% !important; }
          .title { font-size: 22px !important; }
          .header-image { height: 150px !important; }
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          overflow: hidden;
        }
        .header-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
        }
        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.9) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
        }
        .logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-bottom: 10px;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          color: white;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header p {
          margin: 5px 0 0;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 300;
        }
        .content {
          padding: 40px 30px;
          background: white;
        }
        .greeting {
          font-size: 18px;
          color: #374151;
          margin-bottom: 25px;
          font-weight: 500;
        }
        .message-content {
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .message-content p {
          margin-bottom: 15px;
        }
        .original-message {
          border-left: 4px solid #dc2626;
          padding-left: 20px;
          margin: 20px 0;
          background: #f9fafb;
          padding: 15px 20px;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #6b7280;
        }
        .signature {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .footer {
          padding: 30px 20px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer-links {
          margin: 15px 0;
        }
        .footer-links a {
          color: #dc2626;
          text-decoration: none;
          margin: 0 10px;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          padding: 8px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          text-decoration: none;
          width: 35px;
          height: 35px;
          text-align: center;
          line-height: 19px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Image Background -->
        <div class="header">
          <img src="${headerImageUrl}" alt="AKY Media Header" class="header-image" onerror="this.style.display='none'" />
          <div class="header-overlay">
            <img src="${logoUrl}" alt="AKY Media Logo" class="logo" onerror="this.style.display='none'" />
            <h1>AKY Media Center</h1>
            <p>Office of the Governor, Kano State</p>
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${recipientName},</p>
          
          <div class="message-content">
            ${formattedContent}
          </div>
          
          <div class="signature">
            <p><strong>Best regards,</strong></p>
            <p>AKY Media Center<br>
            Office of the Governor<br>
            Kano State Government<br>
            Nigeria</p>
            
            <p style="margin-top: 15px;">
              <strong>Contact Information:</strong><br>
              Email: info@abbakabiryusuf.com<br>
              Website: www.abbakabiryusuf.com
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-links">
            <a href="${baseUrl}">Website</a>
            <a href="${baseUrl}/news">News</a>
            <a href="${baseUrl}/contact">Contact</a>
            <a href="${baseUrl}/about">About</a>
          </div>
          
          <div class="social-links">
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Twitter">t</a>
            <a href="#" title="Instagram">i</a>
            <a href="#" title="LinkedIn">in</a>
          </div>
          
          <p style="margin: 20px 0 10px;">&copy; ${new Date().getFullYear()} AKY Media Center. All rights reserved.</p>
          <p style="margin: 0;">
            This email was sent in response to your inquiry. If you have any questions, please contact us.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, replyTo, recipientName } = (await request.json()) as EmailData

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate the enhanced email template
    const emailHtml = generateReplyEmailHtml(html, recipientName || "Valued Contact", subject)

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: emailHtml,
      replyTo: replyTo || process.env.EMAIL_FROM || process.env.SMTP_USER,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
