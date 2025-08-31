# Template-Based Communication System

This document describes the enhanced template-based communication system that allows customizable email, SMS, and WhatsApp messages for different scenarios.

## Overview

The system automatically sends notifications using templates when users:
- Subscribe to the newsletter (uses `subscribers` templates)
- Submit contact forms (uses `contact-us` templates)

If custom templates are not set, the system falls back to default templates built into the code.

## Template Categories

### 1. Subscribers Templates
Used when users subscribe to the newsletter:
- **Email**: Welcome email with rich HTML formatting
- **SMS**: Welcome SMS message
- **WhatsApp**: Welcome WhatsApp message

### 2. Contact Us Templates
Used when users submit contact forms:
- **Email**: Confirmation email acknowledging receipt
- **SMS**: Confirmation SMS
- **WhatsApp**: Confirmation WhatsApp message

## Template Variables

Templates support variables in the format `{{variable_name}}`. Common variables include:

### Common Variables (Available in all templates)
- `{{site_name}}` - Site name (default: "AKY Media")
- `{{website_url}}` - Website URL
- `{{current_year}}` - Current year
- `{{current_date}}` - Current date
- `{{current_time}}` - Current time
- `{{support_email}}` - Support email address

### Subscriber-Specific Variables
- `{{name}}` - Subscriber's name
- `{{email}}` - Subscriber's email
- `{{phone}}` - Subscriber's phone number
- `{{unsubscribe_url}}` - Unsubscribe link

### Contact Form-Specific Variables
- `{{first_name}}` - Contact's first name
- `{{last_name}}` - Contact's last name
- `{{name}}` - Full name (fallback)
- `{{email}}` - Contact's email
- `{{mobile}}` - Contact's mobile number
- `{{phone}}` - Contact's phone number
- `{{subject}}` - Contact form subject

## API Endpoints

### Template Management

#### Get All Templates
```http
GET /api/communication/templates
```

#### Create Template
```http
POST /api/communication/templates
Content-Type: application/json

{
  "name": "Custom Welcome Email",
  "category": "subscribers",
  "type": "email",
  "subject": "Welcome to {{site_name}}!",
  "content": "Hello {{name}}, welcome to our newsletter!",
  "isActive": true
}
```

#### Update Template
```http
PUT /api/communication/templates
Content-Type: application/json

{
  "id": "template_id",
  "name": "Updated Template",
  "content": "Updated content with {{variables}}"
}
```

#### Delete Template
```http
DELETE /api/communication/templates?id=template_id
```

### Template Initialization

#### Initialize Default Templates
```http
POST /api/communication/templates/initialize
```

#### Check Template Status
```http
GET /api/communication/templates/initialize
```

### Template Preview

#### Preview Template
```http
POST /api/communication/templates/preview
Content-Type: application/json

{
  "category": "subscribers",
  "type": "email",
  "variables": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Quick Preview
```http
GET /api/communication/templates/preview?category=subscribers&type=email
```

### Testing

#### Test Template System
```http
POST /api/communication/test-templates
Content-Type: application/json

{
  "type": "subscribers",
  "email": "test@example.com",
  "phone": "+2348161781643",
  "name": "Test User"
}
```

## How It Works

### 1. Newsletter Subscription Flow
1. User submits newsletter subscription form
2. System saves subscriber to database
3. `EnhancedNotificationService.sendSubscriberNotifications()` is called
4. For each communication type (email, SMS, WhatsApp):
   - System checks for custom template in database
   - If found, uses custom template with variables applied
   - If not found, falls back to default template
   - Sends notification via appropriate API

### 2. Contact Form Flow
1. User submits contact form
2. System saves contact message to database
3. `EnhancedNotificationService.sendContactNotifications()` is called
4. Similar template resolution and sending process as above

### 3. Template Resolution Priority
1. **Custom Template**: Active template from database matching category and type
2. **Default Template**: Built-in template from code
3. **Ultimate Fallback**: Simple generic message

## Database Schema

### Templates Collection (`communication_templates`)
```javascript
{
  _id: ObjectId,
  name: String,
  category: "subscribers" | "contact-us" | "news" | "achievements",
  type: "email" | "sms" | "whatsapp",
  subject: String, // For email templates
  content: String,
  variables: [String], // Auto-extracted from content
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Errors Collection (`notification_errors`)
```javascript
{
  _id: ObjectId,
  type: "welcome_notifications" | "contact_notifications",
  subscriberId: ObjectId, // For subscriber notifications
  contactId: ObjectId, // For contact notifications
  email: String,
  phone: String,
  errors: [String],
  error: String, // Single error message
  timestamp: Date
}
```

## Configuration

### Environment Variables
```env
# Site Configuration
SITE_NAME=AKY Media
NEXT_PUBLIC_BASE_URL=https://abbakabiryusuf.info
SUPPORT_EMAIL=support@abbakabiryusuf.info

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=notify@abbakabiryusuf.info
EMAIL_FROM_NAME=AKY Media

# SMS/WhatsApp Configuration (Termii)
TERMII_API_KEY=your-termii-api-key
TERMII_SENDER_ID=AKY Media
TERMII_WHATSAPP_SENDER_ID=AKY Media

# Database
MONGODB_URI=mongodb+srv://...
```

## Usage Examples

### Creating a Custom Subscriber Email Template
```javascript
const template = {
  name: "Welcome Email v2",
  category: "subscribers",
  type: "email",
  subject: "🎉 Welcome to {{site_name}}, {{name}}!",
  content: `
    <h1>Hello {{name}}!</h1>
    <p>Thank you for subscribing to {{site_name}}.</p>
    <p>Visit us at: <a href="{{website_url}}">{{website_url}}</a></p>
    <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
  `,
  isActive: true
};

// POST to /api/communication/templates
```

### Creating a Custom Contact SMS Template
```javascript
const template = {
  name: "Contact Confirmation SMS",
  category: "contact-us",
  type: "sms",
  content: "Hi {{first_name}}, we received your message about '{{subject}}'. We'll respond within 30 minutes. - {{site_name}}",
  isActive: true
};
```

## Best Practices

### Template Design
1. **Keep SMS/WhatsApp messages under 160 characters** when possible
2. **Use clear, actionable language**
3. **Include unsubscribe links** in subscriber emails
4. **Test templates** before activating them
5. **Use meaningful variable names**

### Variable Usage
1. **Always provide fallbacks** for optional variables
2. **Escape HTML** in email templates when needed
3. **Use consistent naming** across templates
4. **Document custom variables** in template descriptions

### Performance
1. **Templates are cached** for 5 minutes to improve performance
2. **Clear cache** after template updates using `TemplateService.clearCache()`
3. **Initialize default templates** on application startup

## Troubleshooting

### Common Issues

#### Templates Not Loading
- Check database connection
- Verify template exists and is active
- Clear template cache

#### Variables Not Replacing
- Ensure variable format is `{{variable_name}}`
- Check variable spelling
- Verify variable is provided in the context

#### Notifications Not Sending
- Check communication service configuration
- Verify API keys and credentials
- Check notification error logs in database

### Debug Endpoints

#### Check Template Status
```http
GET /api/communication/templates/initialize
```

#### Test Notifications
```http
POST /api/communication/test-templates
```

#### Preview Templates
```http
GET /api/communication/templates/preview?category=subscribers&type=email
```

## Migration Guide

### From Old System
1. **Initialize default templates**: `POST /api/communication/templates/initialize`
2. **Update notification calls** to use `EnhancedNotificationService`
3. **Test all communication flows**
4. **Customize templates** as needed

### Template Updates
1. **Create new template** with updated content
2. **Test using preview endpoint**
3. **Activate new template** and deactivate old one
4. **Monitor notification logs** for issues

## Security Considerations

1. **Validate template content** to prevent XSS in emails
2. **Sanitize user input** before using in templates
3. **Limit template access** to authorized users
4. **Log template changes** for audit purposes
5. **Rate limit** template testing endpoints