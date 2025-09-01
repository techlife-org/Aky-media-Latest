import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Template {
  _id?: ObjectId;
  id?: string;
  name: string;
  category: 'contact-us' | 'subscribers' | 'news' | 'achievements';
  type: 'whatsapp' | 'sms' | 'email';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariables {
  [key: string]: string;
}

export class TemplateService {
  private static instance: TemplateService;
  private templateCache: Map<string, Template> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  private constructor() {}

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Get template by category and type with caching
   */
  async getTemplate(category: string, type: string): Promise<Template | null> {
    const cacheKey = `${category}-${type}`;
    
    // Check cache first
    if (this.isCacheValid() && this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey) || null;
    }

    try {
      const { db } = await connectToDatabase();
      
      const template = await db.collection('communication_templates').findOne({
        category,
        type,
        isActive: true
      }, {
        sort: { updatedAt: -1 } // Get the most recent active template
      });

      if (template) {
        const templateObj: Template = {
          ...template,
          id: template._id.toString()
        };
        
        // Cache the template
        this.templateCache.set(cacheKey, templateObj);
        this.lastCacheUpdate = Date.now();
        
        return templateObj;
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    }

    return null;
  }

  /**
   * Apply variables to template content
   */
  applyVariables(content: string, variables: TemplateVariables): string {
    let processedContent = content;
    
    // Replace variables in the format {{variable_name}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });

    // Clean up any remaining unreplaced variables
    processedContent = processedContent.replace(/{{[^}]*}}/g, '');
    
    return processedContent;
  }

  /**
   * Get processed template with variables applied
   */
  async getProcessedTemplate(
    category: string, 
    type: string, 
    variables: TemplateVariables
  ): Promise<{ subject?: string; content: string; template?: Template } | null> {
    const template = await this.getTemplate(category, type);
    
    if (!template) {
      return null;
    }

    const processedContent = this.applyVariables(template.content, variables);
    const processedSubject = template.subject ? this.applyVariables(template.subject, variables) : undefined;

    return {
      subject: processedSubject,
      content: processedContent,
      template
    };
  }

  /**
   * Get default templates for fallback
   */
  getDefaultTemplate(category: string, type: string, variables: TemplateVariables): { subject?: string; content: string } {
    const defaults = this.getDefaultTemplates();
    const key = `${category}-${type}`;
    
    if (defaults[key]) {
      const template = defaults[key];
      return {
        subject: template.subject ? this.applyVariables(template.subject, variables) : undefined,
        content: this.applyVariables(template.content, variables)
      };
    }

    // Ultimate fallback
    return this.getUltimateFallback(category, type, variables);
  }

  /**
   * Get template with fallback to defaults
   */
  async getTemplateWithFallback(
    category: string, 
    type: string, 
    variables: TemplateVariables
  ): Promise<{ subject?: string; content: string; isCustomTemplate: boolean }> {
    // Try to get custom template first
    const customTemplate = await this.getProcessedTemplate(category, type, variables);
    
    if (customTemplate) {
      return {
        subject: customTemplate.subject,
        content: customTemplate.content,
        isCustomTemplate: true
      };
    }

    // Fallback to default template
    const defaultTemplate = this.getDefaultTemplate(category, type, variables);
    return {
      subject: defaultTemplate.subject,
      content: defaultTemplate.content,
      isCustomTemplate: false
    };
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
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; color: white;">
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
        <a href="{{website_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
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

You can expect a response from us within 2 working days. If your matter is urgent, please indicate this in your subject line.

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

      // News templates
      'news-email': {
        subject: '🚨 {{news_title}} - The AKY Digital Team',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{news_title}} - AKY Digital</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header { padding: 30px 20px !important; }
      .content { padding: 30px 20px !important; }
      .title { font-size: 28px !important; }
      .subtitle { font-size: 16px !important; }
      .news-title { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #f87171 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <div class="container" style="max-width: 650px; margin: 0 auto; background: #ffffff; box-shadow: 0 20px 40px rgba(220, 38, 38, 0.15); border-radius: 16px; overflow: hidden;">
    <!-- Header with Background Image -->
    <div class="header" style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%), url('{{website_url}}/email-header.png'); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 50px 40px; text-align: center; position: relative;">
      <div style="position: relative; z-index: 2;">
        <h1 class="title" style="margin: 0; font-size: 36px; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px;">🚨 Breaking News</h1>
        <p class="subtitle" style="margin: 15px 0 0 0; font-size: 20px; color: white; opacity: 0.95; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">The AKY Digital Team</p>
      </div>
      <!-- Decorative Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>
    </div>
    
    <!-- Content Section -->
    <div class="content" style="padding: 60px 50px; background: linear-gradient(180deg, #ffffff 0%, #fef7f7 100%);">
      <div style="margin-bottom: 50px;">
        <h2 style="color: #dc2626; margin: 0 0 25px 0; font-size: 28px; font-weight: 700; text-align: center;">Dear {{name}},</h2>
        
        <p style="color: #374151; line-height: 1.8; margin: 0 0 30px 0; font-size: 18px; text-align: center; font-weight: 500;">
          🎉 We have exciting news to share with you!
        </p>
        
        <!-- News Card -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 35px; border-radius: 20px; margin: 40px 0; box-shadow: 0 15px 35px rgba(220, 38, 38, 0.2); position: relative; overflow: hidden;">
          <!-- Background Pattern -->
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; opacity: 0.7;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%; opacity: 0.5;"></div>
          
          <div style="position: relative; z-index: 2;">
            <h3 class="news-title" style="color: white; margin: 0 0 20px 0; font-size: 26px; font-weight: 800; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); line-height: 1.3;">{{news_title}}</h3>
            <p style="color: rgba(255,255,255,0.95); margin: 0 0 25px 0; line-height: 1.7; font-size: 16px; font-weight: 400;">{{news_content}}</p>
            
            <div style="margin-top: 20px;">
              <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; backdrop-filter: blur(10px);">{{news_category}}</span>
            </div>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 30px 0 0 0; font-size: 16px; text-align: center;">
          Best regards,<br>
          <strong style="color: #dc2626; font-size: 18px;">The AKY Digital Team</strong>
        </p>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 50px 0;">
        <a href="{{news_url}}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
          🔥 Read Full Story
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px; text-align: center; color: white;">
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">© {{current_year}} AKY Digital. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: rgba(255,255,255,0.8); text-decoration: underline; font-size: 13px; font-weight: 500;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'news-sms': {
        content: `📰 {{news_title}} - The AKY Digital Team

Dear {{name}},

We have exciting news to share! {{news_content}}

Category: {{news_category}}

Read more: {{news_url}}

Best regards,
The AKY Digital Team`
      },
      'news-whatsapp': {
        content: `📰 *{{news_title}}*

Dear *{{name}}*,

We have exciting news to share with you! 🎉

{{news_content}}

📂 *Category:* {{news_category}}

🔗 Read the full article: {{news_url}}

Best regards,
*The AKY Digital Team*`
      },

      // Achievement templates
      'achievements-email': {
        subject: '🏆 {{achievement_title}} - The AKY Digital Team',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{achievement_title}} - AKY Digital</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header { padding: 30px 20px !important; }
      .content { padding: 30px 20px !important; }
      .title { font-size: 28px !important; }
      .subtitle { font-size: 16px !important; }
      .achievement-title { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #f87171 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <div class="container" style="max-width: 650px; margin: 0 auto; background: #ffffff; box-shadow: 0 20px 40px rgba(220, 38, 38, 0.15); border-radius: 16px; overflow: hidden;">
    <!-- Header with Background Image -->
    <div class="header" style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%), url('{{website_url}}/email-header.png'); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 50px 40px; text-align: center; position: relative;">
      <div style="position: relative; z-index: 2;">
        <h1 class="title" style="margin: 0; font-size: 36px; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px;">🏆 Major Achievement</h1>
        <p class="subtitle" style="margin: 15px 0 0 0; font-size: 20px; color: white; opacity: 0.95; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">The AKY Digital Team</p>
      </div>
      <!-- Decorative Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>
    </div>
    
    <!-- Content Section -->
    <div class="content" style="padding: 60px 50px; background: linear-gradient(180deg, #ffffff 0%, #fef7f7 100%);">
      <div style="margin-bottom: 50px;">
        <h2 style="color: #dc2626; margin: 0 0 25px 0; font-size: 28px; font-weight: 700; text-align: center;">Dear {{name}},</h2>
        
        <p style="color: #374151; line-height: 1.8; margin: 0 0 30px 0; font-size: 18px; text-align: center; font-weight: 500;">
          🎉 We're excited to share a significant achievement with you!
        </p>
        
        <!-- Achievement Card -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 35px; border-radius: 20px; margin: 40px 0; box-shadow: 0 15px 35px rgba(220, 38, 38, 0.2); position: relative; overflow: hidden;">
          <!-- Background Pattern -->
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; opacity: 0.7;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%; opacity: 0.5;"></div>
          
          <div style="position: relative; z-index: 2;">
            <h3 class="achievement-title" style="color: white; margin: 0 0 20px 0; font-size: 26px; font-weight: 800; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); line-height: 1.3;">{{achievement_title}}</h3>
            <p style="color: rgba(255,255,255,0.95); margin: 0 0 25px 0; line-height: 1.7; font-size: 16px; font-weight: 400;">{{achievement_description}}</p>
            
            <!-- Achievement Details -->
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin: 25px 0; backdrop-filter: blur(10px);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
                  <strong style="color: white; display: block; margin-bottom: 5px;">📂 Category:</strong>
                  {{achievement_category}}
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
                  <strong style="color: white; display: block; margin-bottom: 5px;">📍 Location:</strong>
                  {{achievement_location}}
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
                  <strong style="color: white; display: block; margin-bottom: 5px;">📅 Date:</strong>
                  {{achievement_date}}
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
                  <strong style="color: white; display: block; margin-bottom: 5px;">📊 Progress:</strong>
                  {{achievement_progress}}%
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div style="background: rgba(255,255,255,0.2); height: 12px; border-radius: 10px; overflow: hidden; margin-top: 15px;">
                <div style="background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%); height: 100%; width: {{achievement_progress}}%; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 30px 0 0 0; font-size: 16px; text-align: center;">
          Best regards,<br>
          <strong style="color: #dc2626; font-size: 18px;">The AKY Digital Team</strong>
        </p>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 50px 0;">
        <a href="{{achievement_url}}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
          🔍 View Details
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px; text-align: center; color: white;">
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">© {{current_year}} AKY Digital. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: rgba(255,255,255,0.8); text-decoration: underline; font-size: 13px; font-weight: 500;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'achievements-sms': {
        content: `🏆 {{achievement_title}} - The AKY Digital Team

Dear {{name}},

We're excited to share a significant achievement! {{achievement_description}}

Category: {{achievement_category}}
Location: {{achievement_location}}
Progress: {{achievement_progress}}%
Date: {{achievement_date}}

Best regards,
The AKY Digital Team`
      },
      'achievements-whatsapp': {
        content: `🏆 *{{achievement_title}}*

Dear *{{name}}*,

We're excited to share a significant achievement with you! 🎉

{{achievement_description}}

📂 *Category:* {{achievement_category}}
📍 *Location:* {{achievement_location}}
📅 *Date:* {{achievement_date}}
📊 *Progress:* {{achievement_progress}}%

{{#achievement_url}}🔗 View details: {{achievement_url}}{{/achievement_url}}

Best regards,
*The AKY Digital Team*`
      }
    };
  }

  /**
   * Ultimate fallback when no template is found
   */
  private getUltimateFallback(category: string, type: string, variables: TemplateVariables): { subject?: string; content: string } {
    const siteName = variables.site_name || 'AKY Digital';
    const name = variables.name || variables.first_name || 'there';

    if (category === 'subscribers') {
      if (type === 'email') {
        return {
          subject: `🎉 You're Now Subscribed to AKY Digital`,
          content: `Dear ${name},\n\nThank you for subscribing to AKY Digital.\n\nBest regards,\nThe AKY Digital Team`
        };
      } else if (type === 'sms') {
        return {
          content: `🎉 You're Now Subscribed to AKY Digital! Dear ${name}, thank you for subscribing. Best regards, The AKY Digital Team`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `🎉 *You're Now Subscribed to AKY Digital!* Dear ${name}, thank you for subscribing. Best regards, *The AKY Digital Team*`
        };
      }
    } else if (category === 'contact-us') {
      if (type === 'email') {
        return {
          subject: `📩 We've Received Your Message – AKY Digital`,
          content: `Dear ${name},\n\nThank you for reaching out to AKY Digital. Your message has been received.\n\nBest regards,\nThe AKY Digital Team`
        };
      } else if (type === 'sms') {
        return {
          content: `📩 We've Received Your Message – AKY Digital. Dear ${name}, thank you for reaching out. Best regards, The AKY Digital Team`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `📩 *We've Received Your Message – AKY Digital* Dear ${name}, thank you for reaching out. Best regards, *The AKY Digital Team*`
        };
      }
    }

    // Final fallback
    return {
      subject: `Message from AKY Digital`,
      content: `Dear ${name},\n\nThank you for your interest in AKY Digital.\n\nBest regards,\nThe AKY Digital Team`
    };
  }

  /**
   * Create default templates in database if they don't exist
   */
  async ensureDefaultTemplates(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('communication_templates');

      const defaultTemplates = this.getDefaultTemplates();
      
      for (const [key, template] of Object.entries(defaultTemplates)) {
        const [category, type] = key.split('-');
        
        const existing = await collection.findOne({ category, type, name: `Default ${category} ${type}` });
        
        if (!existing) {
          await collection.insertOne({
            name: `Default ${category} ${type}`,
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