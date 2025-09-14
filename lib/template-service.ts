import { Db } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

// Define types
interface Template {
  _id?: string;
  category: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateVariables {
  [key: string]: string;
}

interface RenderedTemplate {
  subject?: string;
  content: string;
  isCustomTemplate: boolean;
}

class TemplateService {
  private static instance: TemplateService;
  private db: Db | null = null;
  private templateCache: Map<string, Template> = new Map();
  private lastCacheUpdate: number = 0;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      this.db = db;
      await this.ensureDefaultTemplates();
    } catch (error) {
      console.error('Failed to initialize template service:', error);
    }
  }

  /**
   * Get template by category and type
   */
  async getTemplate(category: string, type: string): Promise<Template | null> {
    const cacheKey = `${category}-${type}`;
    
    // Check cache first
    if (this.isCacheValid() && this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey) || null;
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const template = await this.db.collection<Template>('templates').findOne({
        category,
        type,
        isActive: true
      });

      if (template) {
        this.templateCache.set(cacheKey, template);
        this.lastCacheUpdate = Date.now();
      }

      return template;
    } catch (error) {
      console.error(`Failed to fetch template ${category}-${type}:`, error);
      return null;
    }
  }

  /**
   * Render template with variables
   */
  async renderTemplate(
    category: string,
    type: string,
    variables: TemplateVariables
  ): Promise<RenderedTemplate> {
    try {
      const template = await this.getTemplate(category, type);
      
      if (template) {
        console.log(`Using custom template for ${category}-${type}`);
        return {
          subject: template.subject ? this.interpolate(template.subject, variables) : undefined,
          content: this.interpolate(template.content, variables),
          isCustomTemplate: true
        };
      }
      
      // Fallback to default template
      console.log(`Using default template for ${category}-${type}`);
      const defaultTemplate = this.getDefaultTemplate(category, type, variables);
      return {
        subject: defaultTemplate.subject,
        content: defaultTemplate.content,
        isCustomTemplate: false
      };
    } catch (error) {
      console.error(`Failed to render template ${category}-${type}:`, error);
      
      // Ultimate fallback
      console.log(`Using ultimate fallback for ${category}-${type}`);
      const fallback = this.getUltimateFallback(category, type, variables);
      return {
        subject: fallback.subject,
        content: fallback.content,
        isCustomTemplate: false
      };
    }
  }

  /**
   * Interpolate variables in template
   */
  private interpolate(template: string, variables: TemplateVariables): string {
    let result = template;
    
    // Replace variables in the format {{variable_name}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  /**
   * Default templates for fallback
   */
  private getDefaultTemplates(): Record<string, { subject?: string; content: string }> {
    return {
      // Subscriber templates
      'subscribers-email': {
        subject: '🎉 You\'re Now Subscribed to AKY Digital',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Successful - AKY Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
     <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="AKY Digital Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Subscription Successful ✅</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Welcome to AKY Digital</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for subscribing to AKY Digital.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          You will now receive exclusive updates, insights, and announcements directly from us. Stay tuned for information on digital programs, events, and opportunities that matter.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          We're excited to keep you informed as we work toward driving digital innovation and growth.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{website_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🌐 Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© {{current_year}} AKY Digital. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'subscribers-sms': {
        content: `🎉 You're Now Subscribed to AKY Digital!

Dear {{name}},

Thank you for subscribing to AKY Digital. You will now receive exclusive updates, insights, and announcements directly from us.

We're excited to keep you informed as we work toward driving digital innovation and growth.

Best regards,
The AKY Digital Team

Reply STOP to unsubscribe.`
      },
      'subscribers-whatsapp': {
        content: `🎉 *You're Now Subscribed to AKY Digital!*

Dear *{{name}}*,

Thank you for subscribing to AKY Digital. 🙏

You will now receive exclusive updates, insights, and announcements directly from us. Stay tuned for information on digital programs, events, and opportunities that matter.

We're excited to keep you informed as we work toward driving digital innovation and growth.

🌐 Visit our website: {{website_url}}

Best regards,
*The AKY Digital Team*`
      },

      // News templates
      'news-email': {
        subject: '📰 {{news_title}} - AKY Digital',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{news_title}} - AKY Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="AKY Digital Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Latest News</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">AKY Digital</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">{{news_title}}</h3>
          <div style="text-align: center; margin: 20px 0; display: {{news_image_display}};">
            <img src="{{news_image}}" alt="{{news_title}}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          </div>
          <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
            {{news_content}}
          </p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{news_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Read Full Story
            </a>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© {{current_year}} AKY Digital. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'news-sms': {
        content: `📰 {{news_title}} - AKY Digital

Dear {{name}},

{{news_content}}

Read more: {{news_url}}

Stay informed with the latest updates from AKY Digital.

Best regards,
The AKY Digital Team

Reply STOP to unsubscribe.`
      },
      'news-whatsapp': {
        content: `📰 *{{news_title}} - AKY Digital*

Dear *{{name}}*,

{{news_content}}

📖 Read more: {{news_url}}

Stay informed with the latest updates from AKY Digital.

🌐 Visit our website: {{website_url}}

Best regards,
*The AKY Digital Team* 🙏`
      },

      // Achievements templates
      'achievements-email': {
        subject: '🏆 {{achievement_title}} - AKY Digital',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{achievement_title}} - AKY Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="AKY Digital Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">New Achievement</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">AKY Digital</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">{{achievement_title}}</h3>
          <div style="text-align: center; margin: 20px 0; display: {{achievement_image_display}};">
            <img src="{{achievement_image}}" alt="{{achievement_title}}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          </div>
          <p style="color: #374151; line-height: 1.7; margin: 0 0 15px 0; font-size: 16px;">
            {{achievement_description}}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
            <span style="background: #dc2626; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">{{achievement_location}}</span>
            <span style="background: #374151; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">{{achievement_date}}</span>
            <span style="background: #059669; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">{{achievement_progress}}% Complete</span>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{achievement_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Achievement
            </a>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© {{current_year}} AKY Digital. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'achievements-sms': {
        content: `🏆 {{achievement_title}} - AKY Digital

Dear {{name}},

{{achievement_description}}

📍 Location: {{achievement_location}}
📅 Date: {{achievement_date}}
📊 Progress: {{achievement_progress}}% Complete

We're proud to share this achievement with you.

Best regards,
The AKY Digital Team

Reply STOP to unsubscribe.`
      },
      'achievements-whatsapp': {
        content: `🏆 *{{achievement_title}} - AKY Digital*

Dear *{{name}}*,

{{achievement_description}}

📍 *Location:* {{achievement_location}}
📅 *Date:* {{achievement_date}}
📊 *Progress:* {{achievement_progress}}% Complete

We're proud to share this achievement with you as part of our ongoing commitment to progress and development.

🌐 Visit our website: {{website_url}}

Best regards,
*The AKY Digital Team* 🙏`
      },

      // Contact Us templates
      'contact-us-email': {
        subject: '📩 We\'ve Received Your Message – AKY Digital',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us - AKY Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
    <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="AKY Digital Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Thank You for Contacting Us</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">AKY Digital</p>
    </div>
   
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{first_name}},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for reaching out to AKY Digital. Your message has been received, and our team will review it carefully.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          You can expect a response from us within 2 working days. If your matter is urgent, please indicate this in your subject line or reach us through our official phone number.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          We appreciate your patience and look forward to assisting you.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 35px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 Your message details:</h3>
        <p style="color: #4b5563; margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
        <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
        {{#mobile}}<p style="color: #4b5563; margin: 5px 0;"><strong>Mobile:</strong> {{mobile}}</p>{{/mobile}}
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{website_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🌐 Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© {{current_year}} AKY Digital. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      },
      'contact-us-sms': {
        content: `📩 We've Received Your Message – AKY Digital

Dear {{first_name}},

Thank you for reaching out to AKY Digital. Your message has been received, and our team will review it carefully.

You can expect a response from us within 2 working days. If your matter is urgent, please indicate this in your subject line or reach us through our official phone number.

We appreciate your patience and look forward to assisting you.

Best regards,
The AKY Digital Team`
      },
      'contact-us-whatsapp': {
        content: `📩 *We've Received Your Message – AKY Digital*

Dear *{{first_name}}*,

Thank you for reaching out to AKY Digital. Your message has been received, and our team will review it carefully. ✅

You can expect a response from us within 2 working days. If your matter is urgent, please indicate this in your subject line or reach us through our official phone number.

We appreciate your patience and look forward to assisting you.

🌐 Visit our website: {{website_url}}

Best regards,
*The AKY Digital Team* 🙏`
      },

      // Messages templates (for replies)
      'messages-email': {
        subject: 'Re: {{original_subject}} - AKY Digital',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: {{original_subject}} - AKY Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="AKY Digital Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">AKY Digital Response</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Re: {{original_subject}}</p>
    </div>
   
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
            {{message_content}}
          </p>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          If you have any further questions or need additional assistance, please don't hesitate to reach out.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{website_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🌐 Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© {{current_year}} AKY Digital. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      },
      'messages-sms': {
        content: `Re: {{original_subject}} - AKY Digital

Dear {{name}},

{{message_content}}

If you have any further questions, please don't hesitate to reach out.

Best regards,
The AKY Digital Team`
      },
      'messages-whatsapp': {
        content: `*Re: {{original_subject}} - AKY Digital*

Dear *{{name}}*,

{{message_content}}

If you have any further questions, please don't hesitate to reach out.

🌐 Visit our website: {{website_url}}

Best regards,
*The AKY Digital Team* 🙏`
      }
    };
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(
    category: string,
    type: string,
    variables: TemplateVariables
  ): { subject?: string; content: string } {
    const templates = this.getDefaultTemplates();
    const key = `${category}-${type}`;
    const template = templates[key];
    
    if (template) {
      return {
        subject: template.subject,
        content: template.content
      };
    }
    
    // Ultimate fallback
    return this.getUltimateFallback(category, type, variables);
  }

  /**
   * Ultimate fallback when no template is found
   */
  private getUltimateFallback(
    category: string,
    type: string,
    variables: TemplateVariables
  ): { subject?: string; content: string } {
    const siteName = variables.site_name || 'AKY Digital';
    const name = variables.name || variables.first_name || 'there';
    const websiteUrl = variables.website_url || 'https://abbakabiryusuf.com';
    const currentYear = variables.current_year || new Date().getFullYear().toString();
    
    if (category === 'subscribers') {
      const unsubscribeUrl = variables.unsubscribe_url || `${websiteUrl}/unsubscribe`;
      
      if (type === 'email') {
        return {
          subject: `🎉 You're Now Subscribed to ${siteName}`,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Successful - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="${siteName} Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Subscription Successful ✅</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Welcome to ${siteName}</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for subscribing to ${siteName}.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          You will now receive exclusive updates, insights, and announcements directly from us. Stay tuned for information on digital programs, events, and opportunities that matter.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          We're excited to keep you informed as we work toward driving digital innovation and growth.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The ${siteName} Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${websiteUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© ${currentYear} ${siteName}. All rights reserved.</p>
      <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
        };
      } else if (type === 'sms') {
        return {
          content: `🎉 You're Now Subscribed to ${siteName}! Dear ${name}, thank you for subscribing. You will now receive exclusive updates, insights, and announcements directly from us. Best regards, The ${siteName} Team`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `🎉 *You're Now Subscribed to ${siteName}!*\n\nDear *${name}*,\n\nThank you for subscribing to ${siteName}. 🙏\n\nYou will now receive exclusive updates, insights, and announcements directly from us. Stay tuned for information on digital programs, events, and opportunities that matter.\n\nWe're excited to keep you informed as we work toward driving digital innovation and growth.\n\n🌐 Visit our website: ${websiteUrl}\n\nBest regards,\n*The ${siteName} Team*`
        };
      }
    } else if (category === 'contact-us') {
      if (type === 'email') {
        return {
          subject: `📩 We've Received Your Message – ${siteName}`,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="${siteName} Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Thank You for Contacting Us</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">${siteName}</p>
    </div>
   
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for reaching out to ${siteName}. Your message has been received, and our team will review it carefully.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          You can expect a response from us within 2 working days. If your matter is urgent, please indicate this in your subject line or reach us through our official phone number.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          We appreciate your patience and look forward to assisting you.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The ${siteName} Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${websiteUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© ${currentYear} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
        };
      } else if (type === 'sms' || type === 'whatsapp') {
        return {
          content: `📩 *We've Received Your Message – ${siteName}*\n\nDear *${name}*,\n\nThank you for reaching out to ${siteName}. Your message has been received, and our team will review it carefully.\n\nYou can expect a response from us within 2 working days.\n\nBest regards,\n*The ${siteName} Team*`
        };
      }
    } else if (category === 'messages') {
      const originalSubject = variables.original_subject || 'Your Message';
      const messageContent = variables.message_content || 'Thank you for your message.';
      
      if (type === 'email') {
        return {
          subject: `Re: ${originalSubject} – ${siteName}`,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: ${originalSubject} - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="${siteName} Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${siteName} Response</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Re: ${originalSubject}</p>
    </div>
   
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
            ${messageContent}
          </p>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px;">
          If you have any further questions or need additional assistance, please don't hesitate to reach out.
        </p>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The ${siteName} Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${websiteUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© ${currentYear} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
        };
      } else if (type === 'sms' || type === 'whatsapp') {
        return {
          content: `Re: ${originalSubject} – ${siteName}\n\nDear ${name},\n\n${messageContent}\n\nIf you have any further questions, please don't hesitate to reach out.\n\nBest regards,\nThe ${siteName} Team`
        };
      }
    } else if (category === 'news') {
      const newsTitle = variables.news_title || variables.article_title || 'Latest News';
      const newsContent = variables.news_content || variables.article_content || 'We have exciting news to share with you.';
      const newsUrl = variables.news_url || variables.article_url || variables.website_url || '';
      const newsImage = variables.news_image || '';
      const unsubscribeUrl = variables.unsubscribe_url || `${websiteUrl}/unsubscribe`;
      
      if (type === 'email') {
        return {
          subject: `📰 ${newsTitle} - ${siteName}`,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsTitle} - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="${siteName} Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Latest News</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">${siteName}</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">${newsTitle}</h3>
          ${newsImage && newsImage.trim() !== '' ? `<div style="text-align: center; margin: 20px 0;">
            <img src="${newsImage}" alt="${newsTitle}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          </div>` : ''}
          <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
            ${newsContent}
          </p>
          
          ${newsUrl ? `<div style="text-align: center; margin: 20px 0;">
            <a href="${newsUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Read Full Story
            </a>
          </div>` : ''}
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The ${siteName} Team</strong>
        </p>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© ${currentYear} ${siteName}. All rights reserved.</p>
      <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
        };
      } else if (type === 'sms') {
        return {
          content: `📰 ${newsTitle} - ${siteName}\n\nDear ${name},\n\n${newsContent}\n\n${newsUrl ? `Read more: ${newsUrl}` : ''}\n\nBest regards, The ${siteName} Team`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `📰 *${newsTitle} - ${siteName}*\n\nDear *${name}*,\n\n${newsContent}\n\n${newsUrl ? `📖 Read more: ${newsUrl}` : ''}\n\nStay informed with the latest updates from ${siteName}.\n\nBest regards,\n*The ${siteName} Team* 🙏`
        };
      }
    } else if (category === 'achievements') {
      const achievementTitle = variables.achievement_title || variables.project_title || 'New Achievement';
      const achievementDescription = variables.achievement_description || variables.project_description || 'We\'re proud to share this achievement with you.';
      const achievementUrl = variables.achievement_url || variables.project_url || '';
      const achievementImage = variables.achievement_image || '';
      const achievementLocation = variables.achievement_location || 'Kano State';
      const achievementDate = variables.achievement_date || new Date().toLocaleDateString();
      const achievementProgress = variables.achievement_progress || '100';
      const unsubscribeUrl = variables.unsubscribe_url || `${websiteUrl}/unsubscribe`;
      
      if (type === 'email') {
        return {
          subject: `🏆 ${achievementTitle} - ${siteName}`,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${achievementTitle} - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <img src="https://res.cloudinary.com/dxsc0fqrt/image/upload/v1756715780/aky_logo_R_oaofzg.png" 
        alt="${siteName} Logo" 
        style="width:110px; height:auto; display:block; margin:0 auto 15px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">New Achievement</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">${siteName}</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf4f4 100%); padding: 25px; border-left: 5px solid #dc2626; border-radius: 0 8px 8px 0; margin: 25px 0;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">${achievementTitle}</h3>
          ${achievementImage && achievementImage.trim() !== '' ? `<div style="text-align: center; margin: 20px 0;">
            <img src="${achievementImage}" alt="${achievementTitle}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          </div>` : ''}
          <p style="color: #374151; line-height: 1.7; margin: 0 0 15px 0; font-size: 16px;">
            ${achievementDescription}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
            <span style="background: #dc2626; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">${achievementLocation}</span>
            <span style="background: #374151; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">${achievementDate}</span>
            <span style="background: #059669; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">${achievementProgress}% Complete</span>
          </div>
          
          ${achievementUrl ? `<div style="text-align: center; margin: 20px 0;">
            <a href="${achievementUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Achievement
            </a>
          </div>` : ''}
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The ${siteName} Team</strong>
        </p>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© ${currentYear} ${siteName}. All rights reserved.</p>
      <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
        };
      } else if (type === 'sms') {
        return {
          content: `🏆 ${achievementTitle} - ${siteName}\n\nDear ${name},\n\n${achievementDescription}\n\n${achievementUrl ? `Learn more: ${achievementUrl}` : ''}\n\nBest regards, The ${siteName} Team`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `🏆 *${achievementTitle} - ${siteName}*\n\nDear *${name}*,\n\n${achievementDescription}\n\n${achievementUrl ? `🏆 Learn more: ${achievementUrl}` : ''}\n\nThank you for your continued support.\n\nBest regards,\n*The ${siteName} Team* 🙏`
        };
      }
    }
    
    // Generic fallback
    return {
      subject: `Message from ${siteName}`,
      content: `Dear ${name},\n\nThank you for your message.\n\nBest regards,\nThe ${siteName} Team`
    };
  }

  /**
   * Ensure default templates exist in database
   */
  private async ensureDefaultTemplates(): Promise<void> {
    if (!this.db) return;
    
    try {
      const defaultTemplates = this.getDefaultTemplates();
      
      for (const [key, template] of Object.entries(defaultTemplates)) {
        const [category, type] = key.split('-');
        
        // Check if template already exists
        const existing = await this.db.collection<Template>('templates').findOne({
          category,
          type
        });
        
        if (!existing) {
          // Create default template
          await this.db.collection<Template>('templates').insertOne({
            category,
            type,
            subject: template.subject || null,
            content: template.content,
            variables: this.extractVariablesPrivate(template.content + (template.subject || '')),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`Created default template: ${category}-${type}`);
        }
      }
    } catch (error) {
      console.error('Failed to ensure default templates:', error);
    }
  }

  /**
   * Extract variables from template content
   */
  extractVariables(content: string): string[] {
    const matches = content.match(/{{[^}]+}}/g) || [];
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '').trim()))];
  }

  /**
   * Extract variables from template content (private version)
   */
  private extractVariablesPrivate(content: string): string[] {
    return this.extractVariables(content);
  }

  /**
   * Get common template variables
   */
  getCommonVariables(): TemplateVariables {
    return {
      site_name: process.env.SITE_NAME || 'AKY Digital',
      website_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.info',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString(),
      support_email: process.env.SUPPORT_EMAIL || 'support@abbakabiryusuf.info',
      unsubscribe_url: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`
    };
  }
}

export default TemplateService.getInstance();