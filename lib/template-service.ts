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
        subject: 'Welcome to {{site_name}} Newsletter! 🎉',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{site_name}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🎉 Welcome to {{site_name}}!</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Your gateway to exclusive updates</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 28px;">Hello {{name}}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">We're thrilled to have you join our community</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #dc2626;">
        <p style="color: #374151; line-height: 1.7; margin: 0;">
          🎯 <strong>You're now connected!</strong> Thank you for subscribing to our newsletter. You'll receive the latest updates, news, and exclusive announcements directly to your inbox.
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{website_url}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🌐 Visit Our Website
        </a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
      <a href="{{unsubscribe_url}}" style="color: #dc2626; text-decoration: none; font-size: 13px;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
        `
      },
      'subscribers-sms': {
        content: `🎉 Welcome to {{site_name}}, {{name}}!

Thank you for subscribing! You'll receive:
• Latest updates
• Exclusive announcements  
• Important news

Visit: {{website_url}}

Reply STOP to unsubscribe.`
      },
      'subscribers-whatsapp': {
        content: `🎉 *Welcome to {{site_name}}!*

Hello *{{name}}*,

Thank you for subscribing to our newsletter! 🙏

📰 You'll now receive:
• Latest updates
• Exclusive announcements
• Important news
• Special insights

🌐 Visit our website: {{website_url}}

We're excited to have you with us! 🚀`
      },

      // Contact Us templates
      'contact-us-email': {
        subject: 'Thank you for contacting {{site_name}}',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting us</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">📧 Message Received!</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">We'll get back to you soon</p>
    </div>
    
    <div style="padding: 50px 40px; background: white;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 28px;">Hello {{first_name}}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">Thank you for reaching out to us</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #059669;">
        <p style="color: #374151; line-height: 1.7; margin: 0 0 20px 0;">
          ✅ <strong>Your message has been received!</strong> We appreciate you taking the time to contact us.
        </p>
        <p style="color: #374151; line-height: 1.7; margin: 0;">
          🕐 <strong>Response time:</strong> We'll get back to you within 30 minutes during business hours.
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
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      },
      'contact-us-sms': {
        content: `📧 Thank you for contacting {{site_name}}, {{first_name}}!

Your message has been received. We'll respond within 30 minutes during business hours.

Subject: {{subject}}

Visit: {{website_url}}`
      },
      'contact-us-whatsapp': {
        content: `📧 *Thank you for contacting {{site_name}}!*

Hello *{{first_name}}*,

Your message has been received! ✅

📋 *Subject:* {{subject}}
🕐 *Response time:* Within 30 minutes during business hours

🌐 Visit our website: {{website_url}}

Thank you for reaching out to us! 🙏`
      }
    };
  }

  /**
   * Ultimate fallback when no template is found
   */
  private getUltimateFallback(category: string, type: string, variables: TemplateVariables): { subject?: string; content: string } {
    const siteName = variables.site_name || 'AKY Media';
    const name = variables.name || variables.first_name || 'there';

    if (category === 'subscribers') {
      if (type === 'email') {
        return {
          subject: `Welcome to ${siteName}!`,
          content: `Hello ${name},\n\nThank you for subscribing to our newsletter!\n\nBest regards,\n${siteName} Team`
        };
      } else if (type === 'sms') {
        return {
          content: `Welcome to ${siteName}, ${name}! Thank you for subscribing.`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `Welcome to ${siteName}! Hello ${name}, thank you for subscribing to our newsletter.`
        };
      }
    } else if (category === 'contact-us') {
      if (type === 'email') {
        return {
          subject: `Thank you for contacting ${siteName}`,
          content: `Hello ${name},\n\nThank you for your message. We'll get back to you soon.\n\nBest regards,\n${siteName} Team`
        };
      } else if (type === 'sms') {
        return {
          content: `Thank you for contacting ${siteName}, ${name}! We'll respond soon.`
        };
      } else if (type === 'whatsapp') {
        return {
          content: `Thank you for contacting ${siteName}! Hello ${name}, we'll get back to you soon.`
        };
      }
    }

    // Final fallback
    return {
      subject: `Message from ${siteName}`,
      content: `Hello ${name},\n\nThank you for your interest in ${siteName}.\n\nBest regards,\nThe Team`
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
      site_name: process.env.SITE_NAME || 'AKY Media',
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