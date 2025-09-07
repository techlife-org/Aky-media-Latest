// lib/communication-service.ts
import { TemplateService } from './template-service';

interface CommunicationOptions {
  to: string | string[];
  subject?: string;
  message: string;
  html?: string;
  type: 'contact' | 'subscriber' | 'news' | 'achievements' | 'notification';
  template?: {
    category: string;
    type: 'email' | 'sms' | 'whatsapp';
    variables: Record<string, string>;
  };
}

interface CommunicationResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}

export class CommunicationService {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  /**
   * Send templated communication via email, SMS, or WhatsApp
   */
  async sendTemplatedCommunication(options: CommunicationOptions): Promise<CommunicationResult> {
    try {
      // If template is provided, use it
      if (options.template) {
        const { category, type, variables } = options.template;
        
        // Get template with fallback to defaults
        const template = await this.templateService.getTemplateWithFallback(category, type, variables);
        
        // Apply template content
        if (type === 'email') {
          options.subject = template.subject || options.subject || 'Message from AKY Digital';
          options.html = template.content;
        } else {
          options.message = template.content;
        }
      }

      // Send based on type
      switch (options.type) {
        case 'email':
          return await this.sendEmail(options);
        case 'sms':
          return await this.sendSMS(options);
        case 'whatsapp':
          return await this.sendWhatsApp(options);
        default:
          return await this.sendNotification(options);
      }
    } catch (error) {
      console.error('Communication service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send communication'
      };
    }
  }

  /**
   * Send email using the enhanced email API
   */
  private async sendEmail(options: CommunicationOptions): Promise<CommunicationResult> {
    try {
      const response = await fetch('/api/communication/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          message: options.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          provider: result.data.provider,
          messageId: result.data.messageId,
        };
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Send SMS using Termii API
   */
  private async sendSMS(options: CommunicationOptions): Promise<CommunicationResult> {
    try {
      const response = await fetch('/api/communication/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          message: options.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          provider: 'Termii SMS',
          messageId: result.messageId,
        };
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  /**
   * Send WhatsApp message using Termii API
   */
  private async sendWhatsApp(options: CommunicationOptions): Promise<CommunicationResult> {
    try {
      const response = await fetch('/api/communication/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          message: options.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          provider: 'Termii WhatsApp',
          messageId: result.messageId,
        };
      } else {
        throw new Error(result.error || 'Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp message',
      };
    }
  }

  /**
   * Send notification (generic)
   */
  private async sendNotification(options: CommunicationOptions): Promise<CommunicationResult> {
    // For notifications, we'll use email as the default
    return await this.sendEmail(options);
  }

  /**
   * Send contact confirmation with template
   */
  async sendContactConfirmation(contactData: {
    email: string;
    firstName: string;
    lastName: string;
    subject: string;
    phone?: string;
  }): Promise<CommunicationResult> {
    const variables = {
      first_name: contactData.firstName,
      last_name: contactData.lastName,
      name: `${contactData.firstName} ${contactData.lastName}`,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject,
      website_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.com',
      current_year: new Date().getFullYear().toString(),
    };

    return await this.sendTemplatedCommunication({
      to: contactData.email,
      type: 'email',
      template: {
        category: 'contact-us',
        type: 'email',
        variables,
      },
      message: '', // Will be populated by template
    });
  }

  /**
   * Send admin notification for new contact
   */
  async sendAdminNotification(contactData: {
    email: string;
    firstName: string;
    lastName: string;
    subject: string;
    message: string;
    phone?: string;
  }): Promise<CommunicationResult> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@abbakabiryusuf.com';
    
    const variables = {
      first_name: contactData.firstName,
      last_name: contactData.lastName,
      name: `${contactData.firstName} ${contactData.lastName}`,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject,
      message: contactData.message,
      website_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.com',
      current_year: new Date().getFullYear().toString(),
    };

    return await this.sendTemplatedCommunication({
      to: adminEmail,
      subject: `[${contactData.subject}] New Contact Message - AKY Digital`,
      type: 'email',
      template: {
        category: 'contact-us',
        type: 'email',
        variables,
      },
      message: '', // Will be populated by template
    });
  }
}

export default new CommunicationService();