import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email service
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Log all SMTP-related environment variables for debugging
    console.log('=== SMTP ENVIRONMENT VARIABLES ===');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
    console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'NOT SET');
    console.log('===================================');

    // Validate required environment variables (using SMTP_PASS as in .env file)
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST environment variable is not set');
    }
    
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER environment variable is not set');
    }
    
    // Check for both SMTP_PASS and SMTP_PASSWORD for compatibility
    if (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP_PASS (or SMTP_PASSWORD) environment variable is not set');
    }

    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true';
    // Use SMTP_PASS if available, otherwise fall back to SMTP_PASSWORD
    const password = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    console.log('SMTP Configuration being used:', {
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}***` : 'Not set'
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: password,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
  }

  async sendWelcomeEmail(email: string, name?: string) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AKY Media'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
      to: email,
      subject: 'Welcome to AKY Newsletter! 🎉',
      html: this.getWelcomeEmailTemplate(email, name),
      text: this.getWelcomeEmailText(email, name)
    };

    console.log('Sending welcome email to:', email);
    const result = await this.transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  }

  async sendUnsubscribeConfirmation(email: string, name?: string) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AKY Media'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
      to: email,
      subject: 'Unsubscribed from AKY Newsletter',
      html: this.getUnsubscribeEmailTemplate(email, name),
      text: this.getUnsubscribeEmailText(email, name)
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendResubscribeConfirmation(email: string, name?: string) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AKY Media'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
      to: email,
      subject: 'Welcome Back to AKY Newsletter! 🎉',
      html: this.getResubscribeEmailTemplate(email, name),
      text: this.getResubscribeEmailText(email, name)
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendCustomEmail(email: string, message: string, name?: string) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AKY Media'}" <${process.env.EMAIL_FROM || 'notify@abbakabiryusuf.info'}>`,
      to: email,
      subject: 'Message from AKY Media',
      html: this.getCustomEmailTemplate(email, message, name),
      text: this.getCustomEmailText(email, message, name)
    };

    console.log('Sending custom email to:', email);
    const result = await this.transporter.sendMail(mailOptions);
    console.log('Custom email sent successfully:', result.messageId);
    return result;
  }

  private getWelcomeEmailTemplate(email: string, name?: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AKY Newsletter</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
            <div style="position: relative; z-index: 2;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎉 Welcome to AKY Media!</h1>
              <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95; font-weight: 300;">Your gateway to Governor's exclusive updates</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 50px 40px; background: white;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 15px; background: #fef2f2; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 40px;">👋</span>
              </div>
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">Hello ${name || 'there'}!</h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">We're thrilled to have you join our community</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #dc2626;">
              <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
                🎯 <strong>You're now connected!</strong> Thank you for subscribing to our newsletter. You'll receive the latest updates, news, and exclusive announcements directly to your inbox.
              </p>
              <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
                📈 Stay informed about important initiatives, policy developments, and community events from the Governor's office.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
                display: inline-block; 
                padding: 16px 32px; 
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white; 
                text-decoration: none; 
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
                transition: all 0.3s ease;
              ">
                🌐 Visit Our Website
              </a>
            </div>
            
            <!-- What to Expect -->
            <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin: 35px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📋 What to expect:</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; color: #4b5563; font-size: 15px;">
                  <span style="margin-right: 10px; font-size: 18px;">📰</span>
                  <span>Weekly updates from the Governor's office</span>
                </div>
                <div style="display: flex; align-items: center; color: #4b5563; font-size: 15px;">
                  <span style="margin-right: 10px; font-size: 18px;">📢</span>
                  <span>Important policy announcements</span>
                </div>
                <div style="display: flex; align-items: center; color: #4b5563; font-size: 15px;">
                  <span style="margin-right: 10px; font-size: 18px;">🎉</span>
                  <span>Community event notifications</span>
                </div>
                <div style="display: flex; align-items: center; color: #4b5563; font-size: 15px;">
                  <span style="margin-right: 10px; font-size: 18px;">🔍</span>
                  <span>Exclusive insights and behind-the-scenes content</span>
                </div>
              </div>
            </div>
            
            <!-- Social Media -->
            <div style="text-align: center; margin: 35px 0; padding: 25px; background: #fafafa; border-radius: 10px;">
              <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📱 Follow us on social media</h4>
              <div style="display: inline-flex; gap: 15px;">
                <a href="#" style="display: inline-block; padding: 8px; background: #1da1f2; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Twitter</a>
                <a href="#" style="display: inline-block; padding: 8px; background: #1877f2; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Facebook</a>
                <a href="#" style="display: inline-block; padding: 8px; background: #0a66c2; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">LinkedIn</a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #fef7f7; border-radius: 8px; border: 1px solid #fecaca;">
              <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">
                ⚠️ <strong>Didn't subscribe?</strong> If you didn't sign up for our newsletter, please ignore this email or contact our support team.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" alt="AKY Media" style="height: 40px; width: auto;" onerror="this.style.display='none'">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">
              © ${new Date().getFullYear()} AKY Media. All rights reserved.
            </p>
            <div style="display: inline-flex; gap: 20px; align-items: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy" style="color: #6b7280; text-decoration: none; font-size: 13px;">Privacy Policy</a>
              <span style="color: #d1d5db;">•</span>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms" style="color: #6b7280; text-decoration: none; font-size: 13px;">Terms of Service</a>
              <span style="color: #d1d5db;">•</span>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #dc2626; text-decoration: none; font-size: 13px; font-weight: 500;">Unsubscribe</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0; line-height: 1.4;">
              AKY Media Newsletter<br>
              Governor's Office Communications<br>
              📧 notify@abbakabiryusuf.info
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailText(email: string, name?: string) {
    return `
Welcome to AKY Newsletter!

Hello ${name || 'there'},

Thank you for subscribing to our newsletter. You'll now receive the latest updates, news, and announcements directly to your inbox.

We're excited to have you with us and look forward to keeping you informed about important initiatives and developments.

What to expect:
- Weekly updates from the Governor's office
- Important policy announcements  
- Community event notifications
- Exclusive insights and behind-the-scenes content

Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL}

If you didn't subscribe to our newsletter, please ignore this email or contact our support team.

© ${new Date().getFullYear()} AKY Media. All rights reserved.

Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}
    `;
  }

  private getUnsubscribeEmailTemplate(email: string, name?: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
        <div style="background: #6b7280; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Unsubscribed Successfully</h1>
        </div>
        <div style="padding: 40px 30px; background: white; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Sorry to see you go, ${name || 'there'}! 😢</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            If you change your mind, you can always resubscribe by visiting our website.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
              display: inline-block; 
              padding: 15px 30px; 
              background: #dc2626; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            ">
              Visit Our Website
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © ${new Date().getFullYear()} AKY Media. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  private getUnsubscribeEmailText(email: string, name?: string) {
    return `
Unsubscribed Successfully

Sorry to see you go, ${name || 'there'}!

You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.

If you change your mind, you can always resubscribe by visiting our website: ${process.env.NEXT_PUBLIC_BASE_URL}

© ${new Date().getFullYear()} AKY Media. All rights reserved.
    `;
  }

  private getResubscribeEmailTemplate(email: string, name?: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
        <div style="background: #059669; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome Back! 🎉</h1>
        </div>
        <div style="padding: 40px 30px; background: white; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Great to have you back, ${name || 'there'}! 👋</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            You have successfully resubscribed to our newsletter. You'll continue receiving the latest updates and announcements.
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Thank you for rejoining our community!
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
              display: inline-block; 
              padding: 15px 30px; 
              background: #dc2626; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            ">
              Visit Our Website
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            © ${new Date().getFullYear()} AKY Media. All rights reserved.
          </p>
          <p style="margin: 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" 
               style="color: #6b7280; text-decoration: underline; font-size: 14px;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    `;
  }

  private getResubscribeEmailText(email: string, name?: string) {
    return `
Welcome Back!

Great to have you back, ${name || 'there'}!

You have successfully resubscribed to our newsletter. You'll continue receiving the latest updates and announcements.

Thank you for rejoining our community!

Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL}

© ${new Date().getFullYear()} AKY Media. All rights reserved.

Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}
    `;
  }

  private getCustomEmailTemplate(email: string, message: string, name?: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message from AKY Media</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">📧 Message from AKY Media</h1>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">Personal message for you</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background: white;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">Hello ${name || 'there'}!</h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">We have a message for you:</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc2626;">
              <div style="color: #374151; line-height: 1.7; font-size: 16px; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
                display: inline-block; 
                padding: 15px 30px; 
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white; 
                text-decoration: none; 
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
              ">
                🌐 Visit Our Website
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
              © ${new Date().getFullYear()} AKY Media. All rights reserved.
            </p>
            <p style="margin: 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" 
                 style="color: #6b7280; text-decoration: underline; font-size: 14px;">
                Unsubscribe
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCustomEmailText(email: string, message: string, name?: string) {
    return `
Message from AKY Media

Hello ${name || 'there'},

We have a message for you:

${message}

Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL}

© ${new Date().getFullYear()} AKY Media. All rights reserved.

Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}
    `;
  }
}

// SMS and WhatsApp service
export class TwilioService {
  private client: twilio.Twilio;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.error('Twilio credentials missing:', {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN
      });
      throw new Error('Twilio credentials not configured');
    }
    
    console.log('Initializing Twilio with Account SID:', process.env.TWILIO_ACCOUNT_SID);
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendWelcomeSMS(phone: string, name?: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = `🎉 Welcome to AKY Newsletter, ${name || 'there'}!\n\nThank you for subscribing! You'll receive:\n• Governor's office updates\n• Policy announcements\n• Community events\n• Exclusive insights\n\nVisit: ${process.env.NEXT_PUBLIC_BASE_URL}\n\nReply STOP to unsubscribe.`;

    console.log('Sending SMS to:', phone, 'from:', process.env.TWILIO_PHONE_NUMBER);
    
    const result = await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('SMS sent successfully:', result.sid, 'Status:', result.status);
    return result;
  }

  async sendWelcomeWhatsApp(phone: string, name?: string) {
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      throw new Error('Twilio WhatsApp number not configured');
    }

    // Try to use content template first, fallback to regular message
    try {
      if (process.env.TWILIO_WHATSAPP_CONTENT_SID) {
        // Use your content template with variables
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
        const formattedTime = currentDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });

        console.log('Sending WhatsApp with content template to:', phone);
        console.log('Template variables:', { "1": formattedDate, "2": formattedTime });

        const result = await this.client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          contentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID,
          contentVariables: JSON.stringify({
            "1": formattedDate,
            "2": formattedTime
          }),
          to: `whatsapp:${phone}`
        });
        
        console.log('WhatsApp content template sent:', result.sid, 'Status:', result.status);
        return result;
      }
    } catch (contentError) {
      console.warn('Content template failed, using fallback message:', contentError);
    }

    // Fallback to regular WhatsApp message
    const message = `🎉 *Welcome to AKY Newsletter!*\n\nHello *${name || 'there'}*,\n\nThank you for subscribing to our newsletter! 🙏\n\n📰 You'll now receive:\n• Governor's office updates\n• Policy announcements\n• Community events\n• Exclusive insights\n\n🌐 Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL}\n\nWe're excited to have you with us! 🚀`;

    console.log('Sending WhatsApp fallback message to:', phone);
    
    const result = await this.client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`
    });
    
    console.log('WhatsApp fallback sent:', result.sid, 'Status:', result.status);
    return result;
  }

  async sendUnsubscribeSMS(phone: string, name?: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = `You have been unsubscribed from AKY Newsletter. You will no longer receive SMS updates. Visit ${process.env.NEXT_PUBLIC_BASE_URL} to resubscribe anytime.`;

    return await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }

  async sendResubscribeSMS(phone: string, name?: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = `Welcome back to AKY Newsletter, ${name || 'there'}! 🎉 You're now resubscribed and will receive updates. Reply STOP to unsubscribe.`;

    return await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }

  async sendCustomSMS(phone: string, message: string, name?: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const customMessage = `Hello ${name || 'there'},\n\n${message}\n\nFrom: AKY Media\nReply STOP to unsubscribe.`;

    console.log('Sending custom SMS to:', phone, 'from:', process.env.TWILIO_PHONE_NUMBER);
    
    const result = await this.client.messages.create({
      body: customMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('Custom SMS sent successfully:', result.sid, 'Status:', result.status);
    return result;
  }

  async sendCustomWhatsApp(phone: string, message: string, name?: string) {
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      throw new Error('Twilio WhatsApp number not configured');
    }

    const customMessage = `Hello *${name || 'there'}*,\n\n${message}\n\n_From: AKY Media_\n🌐 ${process.env.NEXT_PUBLIC_BASE_URL}`;

    console.log('Sending custom WhatsApp message to:', phone);
    
    const result = await this.client.messages.create({
      body: customMessage,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`
    });
    
    console.log('Custom WhatsApp sent successfully:', result.sid, 'Status:', result.status);
    return result;
  }
}

// Combined notification service
export class NotificationService {
  private emailService: EmailService;
  private twilioService: TwilioService | null;

  constructor() {
    this.emailService = new EmailService();
    try {
      this.twilioService = new TwilioService();
    } catch (error) {
      console.warn('Twilio service not available:', error);
      this.twilioService = null;
    }
  }

  async sendWelcomeNotifications(email: string, phone?: string, name?: string) {
    console.log('\n=== SENDING WELCOME NOTIFICATIONS ===');
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Name:', name);
    console.log('Twilio Service Available:', !!this.twilioService);
    
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any,
      errors: [] as string[]
    };

    // Send welcome email
    try {
      console.log('\n--- Sending Email ---');
      results.email = await this.emailService.sendWelcomeEmail(email, name);
      console.log('Email result:', !!results.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      results.errors.push(`Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Send welcome SMS if phone is provided and Twilio is available
    if (phone && this.twilioService) {
      try {
        console.log('\n--- Sending SMS ---');
        results.sms = await this.twilioService.sendWelcomeSMS(phone, name);
        console.log('SMS result:', !!results.sms);
      } catch (error) {
        console.error('Failed to send welcome SMS:', error);
        results.errors.push(`Failed to send welcome SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Send welcome WhatsApp if phone is provided and Twilio is available
      try {
        console.log('\n--- Sending WhatsApp ---');
        results.whatsapp = await this.twilioService.sendWelcomeWhatsApp(phone, name);
        console.log('WhatsApp result:', !!results.whatsapp);
      } catch (error) {
        console.error('Failed to send welcome WhatsApp:', error);
        results.errors.push(`Failed to send welcome WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      if (!phone) {
        console.log('No phone number provided, skipping SMS/WhatsApp');
      }
      if (!this.twilioService) {
        console.log('Twilio service not available, skipping SMS/WhatsApp');
      }
    }

    console.log('\n=== NOTIFICATION RESULTS ===');
    console.log('Email sent:', !!results.email);
    console.log('SMS sent:', !!results.sms);
    console.log('WhatsApp sent:', !!results.whatsapp);
    console.log('Errors:', results.errors);
    console.log('=====================================\n');

    return results;
  }

  async sendUnsubscribeNotifications(email: string, phone?: string, name?: string) {
    const results = {
      email: null as any,
      sms: null as any,
      errors: [] as string[]
    };

    // Send unsubscribe email
    try {
      results.email = await this.emailService.sendUnsubscribeConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send unsubscribe email:', error);
      results.errors.push('Failed to send unsubscribe email');
    }

    // Send unsubscribe SMS if phone is provided and Twilio is available
    if (phone && this.twilioService) {
      try {
        results.sms = await this.twilioService.sendUnsubscribeSMS(phone, name);
      } catch (error) {
        console.error('Failed to send unsubscribe SMS:', error);
        results.errors.push('Failed to send unsubscribe SMS');
      }
    }

    return results;
  }

  async sendResubscribeNotifications(email: string, phone?: string, name?: string) {
    const results = {
      email: null as any,
      sms: null as any,
      errors: [] as string[]
    };

    // Send resubscribe email
    try {
      results.email = await this.emailService.sendResubscribeConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send resubscribe email:', error);
      results.errors.push('Failed to send resubscribe email');
    }

    // Send resubscribe SMS if phone is provided and Twilio is available
    if (phone && this.twilioService) {
      try {
        results.sms = await this.twilioService.sendResubscribeSMS(phone, name);
      } catch (error) {
        console.error('Failed to send resubscribe SMS:', error);
        results.errors.push('Failed to send resubscribe SMS');
      }
    }

    return results;
  }

  async sendCustomMessage(email: string, message: string, channels: string[], phone?: string, name?: string) {
    console.log('\n=== SENDING CUSTOM MESSAGE ===');
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Name:', name);
    console.log('Channels:', channels);
    console.log('Message:', message);
    
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any,
      errors: [] as string[]
    };

    // Send custom email if email channel is selected
    if (channels.includes('email')) {
      try {
        console.log('\n--- Sending Custom Email ---');
        results.email = await this.emailService.sendCustomEmail(email, message, name);
        console.log('Custom email result:', !!results.email);
      } catch (error) {
        console.error('Failed to send custom email:', error);
        results.errors.push(`Failed to send custom email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Send custom SMS if SMS channel is selected and phone is provided
    if (channels.includes('sms') && phone && this.twilioService) {
      try {
        console.log('\n--- Sending Custom SMS ---');
        results.sms = await this.twilioService.sendCustomSMS(phone, message, name);
        console.log('Custom SMS result:', !!results.sms);
      } catch (error) {
        console.error('Failed to send custom SMS:', error);
        results.errors.push(`Failed to send custom SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Send custom WhatsApp if WhatsApp channel is selected and phone is provided
    if (channels.includes('whatsapp') && phone && this.twilioService) {
      try {
        console.log('\n--- Sending Custom WhatsApp ---');
        results.whatsapp = await this.twilioService.sendCustomWhatsApp(phone, message, name);
        console.log('Custom WhatsApp result:', !!results.whatsapp);
      } catch (error) {
        console.error('Failed to send custom WhatsApp:', error);
        results.errors.push(`Failed to send custom WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n=== CUSTOM MESSAGE RESULTS ===');
    console.log('Email sent:', !!results.email);
    console.log('SMS sent:', !!results.sms);
    console.log('WhatsApp sent:', !!results.whatsapp);
    console.log('Errors:', results.errors);
    console.log('===================================\n');

    return results;
  }
}