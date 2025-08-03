import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface EmailData {
  to: string
  subject: string
  html: string
  replyTo?: string
  recipientName?: string
}

// // Enhanced email template with proper image handling
// function generateReplyEmailHtml(content: string, recipientName: string, subject: string) {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//       <title>${subject}</title>
//       <style>
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
//         /* Base styles */
//         body {
//           margin: 0;
//           padding: 0;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//           background-color: #f8fafc;
//           color: #333;
//           line-height: 1.6;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
        
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           background: #ffffff;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//           border-radius: 8px;
//           overflow: hidden;
//         }
        
//         .header {
//           position: relative;
//           height: 200px;
//           background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           text-align: center;
//           padding: 20px;
//         }
        
//         .header::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-image: url('${baseUrl}/pictures/email-header.png');
//           background-size: cover;
//           background-position: center;
//           background-repeat: no-repeat;
//           opacity: 0.3;
//         }
        
//         .header-content {
//           position: relative;
//           z-index: 2;
//           color: white;
//         }
        
//         .header-logo {
//           max-width: 120px;
//           height: auto;
//           filter: brightness(0) invert(1);
//           margin-bottom: 10px;
//         }
        
//         .header-title {
//           font-size: 24px;
//           font-weight: 600;
//           margin: 0;
//           text-shadow: 0 2px 4px rgba(0,0,0,0.3);
//         }
        
//         .content {
//           padding: 40px 30px;
//           background: white;
//           line-height: 1.7;
//           color: #4b5563;
//         }
        
//         .greeting {
//           font-size: 18px;
//           color: #111827;
//           margin-bottom: 25px;
//           font-weight: 500;
//         }
        
//         .message-content {
//           margin: 25px 0;
//           font-size: 16px;
//           line-height: 1.7;
//           color: #4b5563;
//           background: #f9fafb;
//           padding: 20px;
//           border-left: 4px solid #dc2626;
//           border-radius: 0 8px 8px 0;
//         }
        
//         .signature {
//           margin-top: 40px;
//           padding-top: 20px;
//           border-top: 1px solid #e5e7eb;
//           color: #6b7280;
//           font-size: 15px;
//         }
        
//         .footer {
//           padding: 30px 20px;
//           text-align: center;
//           font-size: 14px;
//           color: #9ca3af;
//           background: #f9fafb;
//           border-top: 1px solid #e5e7eb;
//         }
        
//         .footer-links {
//           margin: 20px 0;
//           display: flex;
//           justify-content: center;
//           flex-wrap: wrap;
//           gap: 15px;
//         }
        
//         .footer-links a {
//           color: #dc2626;
//           text-decoration: none;
//           transition: color 0.2s;
//           padding: 5px 10px;
//           border-radius: 4px;
//         }
        
//         .footer-links a:hover {
//           color: #b91c1c;
//           background-color: #fef2f2;
//         }
        
//         .social-links {
//           margin: 25px 0;
//           display: flex;
//           justify-content: center;
//           gap: 15px;
//         }
        
//         .social-links a {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           background: #dc2626;
//           color: white;
//           text-decoration: none;
//           transition: all 0.3s ease;
//           font-size: 18px;
//           font-weight: bold;
//         }
        
//         .social-links a:hover {
//           background: #b91c1c;
//           transform: translateY(-2px);
//           box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
//         }
        
//         .footer-address {
//           margin: 20px 0;
//           line-height: 1.6;
//           color: #6b7280;
//         }
        
//         .copyright {
//           margin-top: 20px;
//           padding-top: 20px;
//           border-top: 1px solid #e5e7eb;
//           color: #9ca3af;
//           font-size: 13px;
//         }
        
//         .logo-fallback {
//           width: 120px;
//           height: 60px;
//           background: white;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: bold;
//           color: #dc2626;
//           font-size: 18px;
//           margin-bottom: 10px;
//         }
        
//         @media only screen and (max-width: 600px) {
//           .container {
//             width: 100% !important;
//             border-radius: 0 !important;
//           }
//           .content {
//             padding: 25px 20px !important;
//           }
//           .header {
//             height: 160px !important;
//           }
//           .header-logo, .logo-fallback {
//             max-width: 100px !important;
//           }
//           .footer-links {
//             flex-direction: column;
//             gap: 10px;
//           }
//           .social-links {
//             gap: 10px;
//           }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <!-- Header -->
//         <div class="header">
//           <div class="header-content">
//             <img 
//               src="${baseUrl}/pictures/logo.png" 
//               alt="AKY Media Logo" 
//               class="header-logo"
//               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
//             />
//             <div class="logo-fallback" style="display: none;">
//               AKY MEDIA
//             </div>
//             <h1 class="header-title">AKY Media Center</h1>
//           </div>
//         </div>
        
//         <!-- Content -->
//         <div class="content">
//           <p class="greeting">Dear ${recipientName || "Valued Contact"},</p>
          
//           <div class="message-content">
//             ${content.replace(/\n/g, "<br>")}
//           </div>
          
//           <div class="signature">
//             <p><strong>Best regards,</strong></p>
//             <p><strong>AKY Media Center</strong><br>
//             Office of the Governor<br>
//             Kano State Government<br>
//             Nigeria</p>
            
//             <p style="margin-top: 15px;">
//               <strong>Contact Information:</strong><br>
//               📧 Email: info@abbakabiryusuf.com<br>
//               🌐 Website: www.abbakabiryusuf.com<br>
//               📱 Phone: +234 123 456 7890
//             </p>
//           </div>
//         </div>
        
//         <!-- Footer -->
//         <div class="footer">
//           <div class="social-links">
//             <a href="https://facebook.com/abbakabiryusuf" title="Facebook" target="_blank">f</a>
//             <a href="https://twitter.com/abbakabiryusuf" title="Twitter" target="_blank">𝕏</a>
//             <a href="https://instagram.com/abbakabiryusuf" title="Instagram" target="_blank">📷</a>
//             <a href="https://linkedin.com/company/abbakabiryusuf" title="LinkedIn" target="_blank">in</a>
//           </div>
          
//           <div class="footer-address">
//             <p><strong>📍 Address:</strong><br>
//             Kano State Government House<br>
//             Kano, Nigeria</p>
//           </div>
          
//           <div class="footer-links">
//             <a href="${baseUrl}">🏠 Home</a>
//             <a href="${baseUrl}/about">👥 About Us</a>
//             <a href="${baseUrl}/news">📰 News & Updates</a>
//             <a href="${baseUrl}/contact">📞 Contact Us</a>
//           </div>
          
//           <div class="copyright">
//             &copy; ${new Date().getFullYear()} AKY Media Center. All rights reserved.<br>
//             <small>This email was sent from an official government communication system.</small>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>
//   `
// }

// Enhanced email template with robust image handling and styled social media icons
function generateEmailHtml(content: string, recipientName: string, subject: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com"
  
  // Remove trailing slash and ensure proper URL format
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')

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
          height: 220px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          overflow: hidden;
        }
        
        /* Fallback pattern background if header image fails */
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          opacity: 0.3;
        }
        
        .header::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.2) 100%);
        }
        
        .header-content {
          position: relative;
          z-index: 3;
          color: white;
        }
        
        .logo-container {
          margin-bottom: 15px;
          position: relative;
        }
        
        .header-logo {
          max-width: 140px;
          height: auto;
          filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transition: transform 0.3s ease;
          display: block;
          margin: 0 auto;
        }
        
        .logo-fallback {
          width: 140px;
          height: 70px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          display: none;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #dc2626;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          letter-spacing: 1px;
          margin: 0 auto;
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
        
        .social-links svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
          position: relative;
          z-index: 1;
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
            height: 180px !important;
            padding: 20px !important;
          }
          .header-logo, .logo-fallback {
            max-width: 120px !important;
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
          .social-links svg {
            width: 18px;
            height: 18px;
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
              📱 Phone: +234 123 456 7890
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <!-- Address Section -->
          <div class="footer-address">
            <p><strong>📍 Official Address</strong><br>
            Kano State Government House<br>
            AKY Media Center<br>
            Kano, Nigeria</p>
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
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Additional options for better reliability
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
      // Add message ID for tracking
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${process.env.EMAIL_DOMAIN || "abbakabiryusuf.com"}>`,
    })

    console.log("Email sent successfully:", info.messageId)

    // After successful email sending, update the original message status and store sent email
    if (messageId) {
      try {
        const { db } = await connectToDatabase()

        // Mark original message as replied
        await db.collection("contact_messages").updateOne(
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
          messageId: info.messageId,
          sentAt: new Date(),
          createdAt: new Date(),
        })
      } catch (dbError) {
        console.error("Failed to update message status:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: "Reply sent successfully",
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
