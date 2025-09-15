import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import path from "path"

interface EmailData {
  to: string
  subject: string
  html: string
  replyTo?: string
  recipientName?: string
}

// Enhanced email template with proper image handling and styled social media icons
function generateEmailHtml(content: string, recipientName: string, subject: string, originalMessage?: any) {
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
        
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          margin: 0;
          padding: 20px 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f1f5f9;
          color: #333;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .header {
          position: relative;
          height: 80px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          overflow: hidden;
        }
        
        .header-content {
          position: relative;
          z-index: 3;
          color: white;
        }
        
        .header-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 3px 6px rgba(0,0,0,0.4);
          letter-spacing: -0.5px;
        }
        
        .content {
          padding: 45px 35px;
          background: white;
          line-height: 1.8;
          color: #4b5563;
        }
        
        .greeting {
          font-size: 20px;
          color: #111827;
          margin-bottom: 30px;
          font-weight: 600;
        }
        
        .message-content {
          margin: 30px 0;
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
          background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
          padding: 25px;
          border-left: 5px solid #dc2626;
          border-radius: 0 12px 12px 0;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
        }
        
        .signature {
          margin-top: 45px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.7;
        }
        
        .signature strong {
          color: #374151;
        }
        
        .footer {
          padding: 40px 30px;
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e2e8f0;
        }
        
        .social-links {
          margin: 30px 0;
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .social-links a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .social-links a:hover {
          background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
        }
        
        .social-links a:hover::before {
          left: 100%;
        }
        
        .footer-address {
          margin: 30px 0;
          line-height: 1.7;
          color: #6b7280;
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .footer-links {
          margin: 25px 0;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .footer-links a {
          color: #dc2626;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #dc2626;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .footer-links a:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        .copyright {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
        }
        
        /* Responsive Design */
        @media only screen and (max-width: 640px) {
          body { padding: 10px 0; }
          .container {
            width: 95% !important;
            margin: 0 auto;
            border-radius: 8px !important;
          }
          .content {
            padding: 30px 20px !important;
          }
          .header {
            height: 50px !important;
            padding: 20px !important;
          }
          .header-title {
            font-size: 22px !important;
          }
          .greeting {
            font-size: 18px !important;
          }
          .message-content {
            padding: 20px !important;
            margin: 20px 0 !important;
          }
          .footer {
            padding: 25px 15px !important;
          }
          .footer-links {
            flex-direction: column;
            gap: 12px;
          }
          .social-links {
            gap: 15px;
          }
          .social-links a {
            width: 45px;
            height: 45px;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .header-title {
            font-size: 20px !important;
          }
          .greeting {
            font-size: 16px !important;
          }
          .message-content {
            font-size: 15px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <h1 class="header-title">AKY Media Center</h1>
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${recipientName || "Valued Contact"},</p>
          
          <div class="message-content">
            ${content.replace(/\n/g, "<br>")}
          </div>
          
          ${originalMessage ? `
          <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">📧 Your Original Message</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 15px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>Subject:</strong> ${originalMessage.subject || 'No subject'}</p>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>Sent on:</strong> ${originalMessage.createdAt ? new Date(originalMessage.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}</p>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 15px;">${originalMessage.message ? originalMessage.message.replace(/\n/g, '<br>') : 'Message content not available'}</p>
              </div>
            </div>
          </div>` : ''}
          
          <div class="signature">
            <p><strong>Best regards,</strong></p>
            <p><strong>AKY Media Center</strong><br>
            Office of the Governor<br>
            Kano State Government<br>
            Nigeria</p>
            
            <p style="margin-top: 20px;">
              <strong>Contact Information:</strong><br>
                📧 Email: info@abbakabiryusuf.com<br>
                🌐 Website: www.abbakabiryusuf.com<br>
                📱 Phone: +2347074222252
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <!-- Address Section -->
          <div class="footer-address">
            <p><strong>📍 Official Address</strong><br>
            Kano State Kano, Nigeria</p>
          </div>
          
          <!-- Copyright -->
          <div class="copyright">
            &copy; ${new Date().getFullYear()} AKY Media Center, Kano State Government. All rights reserved.<br>
            <small>This email was sent from an official government communication system.<br>
            Please do not reply directly to this email. For inquiries, use our contact information above.</small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, replyTo, recipientName, messageId } = (await request.json()) as EmailData & {
      messageId?: string
    }
    
    // Get original message details if messageId is provided
    let originalMessage = null;
    if (messageId) {
      try {
        const { db } = await connectToDatabase();
        originalMessage = await db.collection("contacts").findOne({ _id: new ObjectId(messageId) });
        console.log('Original message found:', {
          messageId,
          found: !!originalMessage,
          subject: originalMessage?.subject,
          hasMessage: !!originalMessage?.message
        });
      } catch (error) {
        console.error('Failed to fetch original message:', error);
      }
    }

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
    console.log('Generating email template with:', {
      hasOriginalMessage: !!originalMessage,
      originalSubject: originalMessage?.subject,
      originalCreatedAt: originalMessage?.createdAt,
      originalMessageLength: originalMessage?.message?.length
    });
    
    const emailHtml = generateEmailHtml(html, recipientName || "Valued Contact", subject, originalMessage)

    // Use the enhanced communication API instead of nodemailer directly
    const communicationApiUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/communication/email`
      : 'http://localhost:3000/api/communication/email';
      
    const response = await fetch(communicationApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html: emailHtml,
        message: html.replace(/<[^>]*>/g, ''), // Plain text version
        replyTo: replyTo || process.env.EMAIL_FROM || process.env.SMTP_USER,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to send email through communication API")
    }

    console.log("Email sent successfully through communication API:", result.data.messageId)

    // After successful email sending, update the original message status and store sent email
    if (messageId) {
      try {
        const { db } = await connectToDatabase()

        // Mark original message as replied
        await db.collection("contacts").updateOne(
          { _id: new ObjectId(messageId) },
          {
            $set: {
              status: "replied",
              updatedAt: new Date(),
              repliedAt: new Date(),
            },
          },
        )

        // Store sent reply
        await db.collection("sent_emails").insertOne({
          to,
          subject,
          content: html,
          type: "reply",
          originalMessageId: messageId,
          status: "sent",
          messageId: result.data.messageId,
          sentAt: new Date(),
          createdAt: new Date(),
        })
      } catch (dbError) {
        console.error("Failed to update message status:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result.data.messageId,
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Failed to send email:", error)

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
