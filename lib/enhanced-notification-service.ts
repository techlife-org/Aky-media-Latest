import TemplateService, { TemplateVariables } from './template-service';

interface NotificationOptions {
  email?: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  subject?: string;
  mobile?: string;
  additionalVariables?: TemplateVariables;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  usedTemplate?: boolean;
}

interface NotificationResults {
  email: NotificationResult | null;
  sms: NotificationResult | null;
  whatsapp: NotificationResult | null;
  errors: string[];
}

export class EnhancedNotificationService {
  private templateService: typeof TemplateService;

  constructor() {
    this.templateService = TemplateService;
  }

  /**
   * Send notifications for newsletter subscribers
   */
  async sendSubscriberNotifications(options: NotificationOptions): Promise<NotificationResults> {
    const { email, phone, name } = options;
    
    console.log('\n=== SENDING SUBSCRIBER NOTIFICATIONS ===');
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Name:', name);
    
    const results: NotificationResults = {
      email: null,
      sms: null,
      whatsapp: null,
      errors: []
    };

    // Prepare common variables
    const variables = this.prepareVariables({
      ...options,
      category: 'subscribers'
    });

    // Send email notification
    if (email) {
      try {
        console.log('\n--- Sending Subscriber Email ---');
        results.email = await this.sendEmailNotification('subscribers', email, variables);
        console.log('Email result:', results.email);
      } catch (error) {
        const errorMsg = `Failed to send subscriber email: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.email = { success: false, error: errorMsg };
      }
    }

    // Send SMS notification
    if (phone) {
      try {
        console.log('\n--- Sending Subscriber SMS ---');
        results.sms = await this.sendSMSNotification('subscribers', phone, variables);
        console.log('SMS result:', results.sms);
      } catch (error) {
        const errorMsg = `Failed to send subscriber SMS: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.sms = { success: false, error: errorMsg };
      }

      // Send WhatsApp notification
      try {
        console.log('\n--- Sending Subscriber WhatsApp ---');
        results.whatsapp = await this.sendWhatsAppNotification('subscribers', phone, variables);
        console.log('WhatsApp result:', results.whatsapp);
      } catch (error) {
        const errorMsg = `Failed to send subscriber WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.whatsapp = { success: false, error: errorMsg };
      }
    }

    console.log('\n=== SUBSCRIBER NOTIFICATION RESULTS ===');
    console.log('Email sent:', !!results.email?.success);
    console.log('SMS sent:', !!results.sms?.success);
    console.log('WhatsApp sent:', !!results.whatsapp?.success);
    console.log('Errors:', results.errors);
    console.log('==========================================\n');

    return results;
  }

  /**
   * Send notifications for contact form submissions
   */
  async sendContactNotifications(options: NotificationOptions): Promise<NotificationResults> {
    const { email, phone, firstName, lastName, subject, mobile } = options;
    
    console.log('\n=== SENDING CONTACT NOTIFICATIONS ===');
    console.log('Email:', email);
    console.log('Phone:', phone || mobile);
    console.log('Name:', firstName, lastName);
    console.log('Subject:', subject);
    
    const results: NotificationResults = {
      email: null,
      sms: null,
      whatsapp: null,
      errors: []
    };

    // Prepare common variables
    const variables = this.prepareVariables({
      ...options,
      name: firstName || options.name,
      category: 'contact-us'
    });

    const contactPhone = phone || mobile;

    // Send email notification
    if (email) {
      try {
        console.log('\n--- Sending Contact Email ---');
        results.email = await this.sendEmailNotification('contact-us', email, variables);
        console.log('Email result:', results.email);
      } catch (error) {
        const errorMsg = `Failed to send contact email: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.email = { success: false, error: errorMsg };
      }
    }

    // Send SMS notification if phone is provided
    if (contactPhone) {
      try {
        console.log('\n--- Sending Contact SMS ---');
        results.sms = await this.sendSMSNotification('contact-us', contactPhone, variables);
        console.log('SMS result:', results.sms);
      } catch (error) {
        const errorMsg = `Failed to send contact SMS: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.sms = { success: false, error: errorMsg };
      }

      // Send WhatsApp notification
      try {
        console.log('\n--- Sending Contact WhatsApp ---');
        results.whatsapp = await this.sendWhatsAppNotification('contact-us', contactPhone, variables);
        console.log('WhatsApp result:', results.whatsapp);
      } catch (error) {
        const errorMsg = `Failed to send contact WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.whatsapp = { success: false, error: errorMsg };
      }
    }

    console.log('\n=== CONTACT NOTIFICATION RESULTS ===');
    console.log('Email sent:', !!results.email?.success);
    console.log('SMS sent:', !!results.sms?.success);
    console.log('WhatsApp sent:', !!results.whatsapp?.success);
    console.log('Errors:', results.errors);
    console.log('=====================================\n');

    return results;
  }

  /**
   * Send email notification using template
   */
  private async sendEmailNotification(category: string, email: string, variables: TemplateVariables): Promise<NotificationResult> {
    try {
      // Get template with fallback
      const template = await this.templateService.getTemplateWithFallback(category, 'email', variables);
      
      // Prepare email payload
      const emailPayload = {
        to: email,
        subject: template.subject || `Message from ${variables.site_name}`,
        message: template.content,
        html: template.content
      };

      // Send email via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/communication/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          messageId: result.data?.messageId,
          provider: 'SMTP',
          usedTemplate: template.isCustomTemplate
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send email',
          provider: 'SMTP'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'SMTP'
      };
    }
  }

  /**
   * Send SMS notification using template
   */
  private async sendSMSNotification(category: string, phone: string, variables: TemplateVariables): Promise<NotificationResult> {
    try {
      // Get template with fallback
      const template = await this.templateService.getTemplateWithFallback(category, 'sms', variables);
      
      // Prepare SMS payload
      const smsPayload = {
        to: phone,
        message: template.content
      };

      // Send SMS via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/communication/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsPayload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          messageId: result.data?.messageId,
          provider: 'Termii SMS',
          usedTemplate: template.isCustomTemplate
        };
      } else {
        // Check if it's a sender ID issue
        const errorMsg = result.error || result.message || 'Failed to send SMS';
        const isSenderIdIssue = errorMsg.includes('ApplicationSenderId not found') || errorMsg.includes('senderName');
        
        return {
          success: false,
          error: isSenderIdIssue ? 
            'SMS sender ID pending approval. Contact Termii support to approve sender ID.' : 
            errorMsg,
          provider: 'Termii SMS'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Termii SMS'
      };
    }
  }

  /**
   * Send WhatsApp notification using template
   */
  private async sendWhatsAppNotification(category: string, phone: string, variables: TemplateVariables): Promise<NotificationResult> {
    try {
      // Get template with fallback
      const template = await this.templateService.getTemplateWithFallback(category, 'whatsapp', variables);
      
      // Prepare WhatsApp payload
      const whatsappPayload = {
        to: phone,
        message: template.content,
        type: 'text'
      };

      // Send WhatsApp via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/communication/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          messageId: result.data?.messageId,
          provider: 'Termii WhatsApp',
          usedTemplate: template.isCustomTemplate
        };
      } else {
        // Check if it's a sender ID issue
        const errorMsg = result.error || result.message || 'Failed to send WhatsApp';
        const isSenderIdIssue = errorMsg.includes('ApplicationSenderId not found') || errorMsg.includes('senderName');
        
        return {
          success: false,
          error: isSenderIdIssue ? 
            'WhatsApp sender ID pending approval. Contact Termii support to approve sender ID.' : 
            errorMsg,
          provider: 'Termii WhatsApp'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Termii WhatsApp'
      };
    }
  }

  /**
   * Prepare template variables
   */
  private prepareVariables(options: NotificationOptions & { category?: string }): TemplateVariables {
    const commonVars = this.templateService.getCommonVariables();
    
    const variables: TemplateVariables = {
      ...commonVars,
      name: options.name || options.firstName || 'there',
      first_name: options.firstName || options.name || 'there',
      last_name: options.lastName || '',
      email: options.email || '',
      mobile: options.mobile || options.phone || '',
      phone: options.phone || options.mobile || '',
      subject: options.subject || '',
      ...options.additionalVariables
    };

    // Add unsubscribe URL for subscribers
    if (options.category === 'subscribers' && options.email) {
      variables.unsubscribe_url = `${commonVars.website_url}/unsubscribe?email=${encodeURIComponent(options.email)}`;
    }

    return variables;
  }

  /**
   * Initialize default templates
   */
  async initializeDefaultTemplates(): Promise<void> {
    try {
      await this.templateService.ensureDefaultTemplates();
      console.log('Default templates initialized successfully');
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
    }
  }

  /**
   * Clear template cache
   */
  clearTemplateCache(): void {
    this.templateService.clearCache();
  }
}

export default EnhancedNotificationService;