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
        subject: '📰 {{news_title}} - The AKY Digital Team',
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
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">📰 Latest News Update</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">The AKY Digital Team</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          We have exciting news to share with you!
        </p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 35px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">{{news_title}}</h3>
          <p style="color: #4b5563; margin: 5px 0; line-height: 1.6;">{{news_content}}</p>
          <div style="margin-top: 15px;">
            <span style="background: #dc2626; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize;">{{news_category}}</span>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{news_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          📖 Read Full Article
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
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🏆 New Achievement</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">The AKY Digital Team</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear {{name}},</h2>
        
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0; font-size: 16px;">
          We're excited to share a significant achievement with you!
        </p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 35px 0; border: 1px solid #d1fae5;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">{{achievement_title}}</h3>
          <p style="color: #4b5563; margin: 5px 0 15px 0; line-height: 1.6;">{{achievement_description}}</p>
          
          <div style="margin: 15px 0;">
            <p style="color: #4b5563; margin: 5px 0;"><strong>Category:</strong> {{achievement_category}}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Location:</strong> {{achievement_location}}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Date:</strong> {{achievement_date}}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Progress:</strong> {{achievement_progress}}%</p>
          </div>
          
          <div style="background: #059669; height: 8px; border-radius: 4px; margin: 15px 0;">
            <div style="background: #34d399; height: 8px; border-radius: 4px; width: {{achievement_progress}}%;"></div>
          </div>
        </div>
        
        <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 16px;">
          Best regards,<br>
          <strong>The AKY Digital Team</strong>
        </p>
      </div>
      
      {{#achievement_url}}
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{achievement_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🔍 View Details
        </a>
      </div>
      {{/achievement_url}}
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