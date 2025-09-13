# Communication Templates System - Complete Guide

## 🎯 Overview

The Communication Center now includes a comprehensive template system with **four template sections** for each communication method (WhatsApp, SMS, Email):

1. **📞 Contact Us** - Response templates for customer inquiries
2. **👥 Subscribers** - Welcome and subscription management templates  
3. **📰 News** - News alerts and article templates
4. **🏆 Achievements** - Achievement and recognition templates

## ✨ Features

### Template Categories
- **Contact Us**: Automated responses for customer inquiries
- **Subscribers**: Welcome messages and subscription confirmations
- **News**: Breaking news alerts and article notifications
- **Achievements**: Recognition and achievement announcements

### Communication Methods
- **WhatsApp**: Text-based templates via Termii
- **SMS**: Short message templates via Termii
- **Email**: Rich email templates with subjects via Hostinger SMTP

### Template Features
- **Variable Support**: Use `{{variable}}` syntax for dynamic content
- **Auto-Detection**: Variables are automatically detected and displayed
- **Preview**: Real-time preview of template content
- **Apply to Forms**: One-click application to communication forms
- **CRUD Operations**: Create, Read, Update, Delete templates
- **Persistent Storage**: Templates saved to MongoDB with localStorage fallback

## 📋 Default Templates Included

### Contact Us Templates

#### WhatsApp
```
Hello {{name}},

Thank you for contacting AKY Digital Hub We have received your message and will get back to you within 24 hours.

Your inquiry: {{message}}

Best regards,
AKY Digital Hub
```

#### SMS
```
Hi {{name}}, thanks for contacting AKY Digital Hub! We'll respond to your inquiry within 24hrs. Ref: {{ref}}
```

#### Email
```
Subject: Thank you for contacting AKY Digital Hub - {{ref}}

Dear {{name}},

Thank you for reaching out to AKY Digital Hub. We have received your message and appreciate you taking the time to contact us.

Your Message:
{{message}}

Our team will review your inquiry and respond within 24 hours. If your matter is urgent, please call us at +234 707 4222 2252.

Reference Number: {{ref}}

Best regards,
AKY Media Customer Service Team

Email: notify@abbakabiryusuf.info
Website: https://abbakabiryusuf.com
```

### Subscribers Templates

#### WhatsApp
```
Welcome to AKY Digital, {{name}}! 🎉

Thank you for subscribing to our updates. You'll now receive:
• Latest news and updates
• Exclusive content
• Event notifications

Stay connected with us!
```

#### SMS
```
Welcome {{name}}! You're now subscribed to AKY Media updates. Reply STOP to unsubscribe.
```

#### Email
```
Subject: Welcome to AKY Digital Hub Newsletter - {{name}}

Dear {{name}},

Welcome to the AKY Digital Hub community! 🎉

Thank you for subscribing to our newsletter. You've joined thousands of readers who stay updated with:

• Latest news and insights
• Exclusive interviews and content
• Event announcements and invitations
• Youth program updates
• Achievement highlights

What to expect:
- Weekly newsletter every Friday
- Breaking news alerts
- Special announcements

You can manage your subscription preferences or unsubscribe at any time by clicking the link at the bottom of our emails.

Welcome aboard!

Best regards,
The AKY Digital Hub

Website: https://abbakabiryusuf.com
Email: notify@abbakabiryusuf.info
```

### News Templates

#### WhatsApp
```
🚨 BREAKING NEWS

{{headline}}

{{summary}}

Read full story: {{link}}

#AKYMedia #News
```

#### SMS
```
NEWS: {{headline}} - {{summary}} Read more: {{link}}
```

#### Email
```
Subject: {{headline}} - AKY Digital Hub

Dear {{name}},

{{headline}}

{{content}}

Published: {{date}}
Author: {{author}}

Read the full article on our website: {{link}}

Stay informed with AKY Media.

Best regards,
AKY Media Digital Hub
```

### Achievements Templates

#### WhatsApp
```
🏆 ACHIEVEMENT UNLOCKED!

Congratulations {{name}}! 🎉

You have achieved: {{achievement}}

{{description}}

Date: {{date}}

Well done! Keep up the excellent work!

#Achievement #Success #AKYMedia
```

#### SMS
```
Congratulations {{name}}! You achieved: {{achievement}} on {{date}}. Well done!
```

#### Email
```
Subject: Congratulations on Your Achievement - {{achievement}}

Dear {{name}},

Congratulations! 🎉

We are delighted to inform you that you have successfully achieved:

{{achievement}}

Achievement Details:
{{description}}

Date Achieved: {{date}}
Category: {{category}}
Level: {{level}}

This achievement reflects your dedication, hard work, and commitment to excellence. We are proud to have you as part of the AKY Digital Hub community.

Your achievement certificate is attached to this email. You can also view and download it from your dashboard.

Keep up the excellent work!

Best regards,
AKY Digital Hub Team

Website: https://abbakabiryusuf.com
Email: notify@abbakabiryusuf.info
```

## 🛠️ How to Use Templates

### 1. Access Templates
- Go to Communication Center
- Click on the **Templates** tab (default tab)
- Browse templates by category: Contact Us, Subscribers, News, Achievements

### 2. Create New Template
1. Click **Create Template** button
2. Fill in template details:
   - **Name**: Descriptive name for the template
   - **Category**: Choose from 4 categories
   - **Type**: WhatsApp, SMS, or Email
   - **Subject**: Required for email templates
   - **Content**: Template message with variables
3. Use `{{variable}}` syntax for dynamic content
4. Preview your template
5. Click **Create Template**

### 3. Edit Existing Template
1. Click the **eye icon** on any template card
2. Modify template details
3. Click **Update Template**

### 4. Apply Template to Communication
1. **Method 1**: Click **send icon** on template card (auto-applies and switches to communication tab)
2. **Method 2**: In WhatsApp/SMS/Email tabs, use the template dropdown to select and apply

### 5. Delete Template
1. Click **eye icon** to edit template
2. Click **Delete Template** button
3. Confirm deletion

## 🔧 Variable System

### Syntax
Use double curly braces: `{{variableName}}`

### Common Variables
- `{{name}}` - Recipient's name
- `{{email}}` - Recipient's email
- `{{phone}}` - Recipient's phone
- `{{message}}` - Original message content
- `{{date}}` - Current date or specific date
- `{{ref}}` - Reference number
- `{{link}}` - Website or article link
- `{{company}}` - Company name
- `{{achievement}}` - Achievement name
- `{{description}}` - Description text

### Auto-Detection
- Variables are automatically detected when typing
- Displayed as badges below the content area
- No need to manually define variables

## 💾 Data Storage

### Primary Storage: MongoDB
- Templates stored in `communication_templates` collection
- Full CRUD operations via API endpoints
- Persistent across sessions and devices

### Fallback Storage: localStorage
- Used when MongoDB is unavailable
- Ensures templates work even without database connection
- Key: `aky-communication-templates`

### API Endpoints
- `GET /api/communication/templates` - Fetch all templates
- `POST /api/communication/templates` - Create new template
- `PUT /api/communication/templates` - Update existing template
- `DELETE /api/communication/templates/[id]` - Delete specific template
- `GET /api/communication/templates/[id]` - Get specific template

## 🎨 Template Categories Explained

### 📞 Contact Us
**Purpose**: Automated responses for customer inquiries
**Use Cases**:
- Acknowledgment of received messages
- Support ticket confirmations
- Response time expectations
- Contact information sharing

### 👥 Subscribers
**Purpose**: Welcome and subscription management
**Use Cases**:
- Welcome new subscribers
- Subscription confirmations
- Newsletter introductions
- Unsubscribe confirmations

### 📰 News
**Purpose**: News alerts and article notifications
**Use Cases**:
- Breaking news alerts
- Article notifications
- Newsletter content
- Press releases

### 🏆 Achievements
**Purpose**: Recognition and achievement announcements
**Use Cases**:
- Achievement certificates
- Recognition messages
- Milestone celebrations
- Award notifications

## 🚀 Best Practices

### Template Naming
- Use descriptive names: "Welcome New Subscriber - WhatsApp"
- Include communication type in name
- Be specific about purpose

### Content Guidelines
- Keep SMS templates under 160 characters
- Use clear, professional language
- Include relevant contact information
- Add unsubscribe options where appropriate

### Variable Usage
- Use consistent variable names across templates
- Provide fallback text for optional variables
- Test templates with sample data

### Organization
- Create templates for each communication method
- Maintain consistency across categories
- Regular review and updates

## 🔍 Troubleshooting

### Templates Not Loading
1. Check MongoDB connection
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Templates will fallback to localStorage

### Variables Not Working
1. Ensure proper `{{variable}}` syntax
2. Check for typos in variable names
3. Verify variables are detected in preview

### Template Not Applying
1. Ensure template type matches communication method
2. Check for JavaScript errors in console
3. Refresh page and try again

## 📊 Template Statistics

### Default Templates Provided
- **Total**: 12 templates
- **Contact Us**: 3 templates (WhatsApp, SMS, Email)
- **Subscribers**: 3 templates (WhatsApp, SMS, Email)
- **News**: 3 templates (WhatsApp, SMS, Email)
- **Achievements**: 3 templates (WhatsApp, SMS, Email)

### Variable Usage
- **Contact Us**: name, message, ref
- **Subscribers**: name
- **News**: headline, summary, link, name, content, date, author
- **Achievements**: name, achievement, description, date, category, level

## 🎯 Future Enhancements

### Planned Features
- Template scheduling
- A/B testing for templates
- Template analytics and performance tracking
- Bulk template operations
- Template import/export
- Rich text editor for email templates
- Template versioning
- Template approval workflow

### Integration Opportunities
- CRM system integration
- Marketing automation
- Customer support ticketing
- Analytics and reporting
- Multi-language support

---

**Your Communication Center now has a powerful template system that makes sending consistent, professional messages easy and efficient!** 🎉

The template system is fully functional with persistent storage, variable support, and seamless integration with all communication methods.