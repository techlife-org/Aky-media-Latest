#!/usr/bin/env node

/**
 * Initialize Default Templates Script
 * 
 * This script initializes the default communication templates in the database.
 * Run this after setting up the project to ensure default templates are available.
 * 
 * Usage:
 *   node scripts/init-templates.js
 *   npm run init-templates
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const defaultTemplates = [
  // Subscriber Email Template
  {
    name: 'Default Subscriber Email',
    category: 'subscribers',
    type: 'email',
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
    `,
    variables: ['site_name', 'name', 'website_url', 'current_year', 'unsubscribe_url'],
    isActive: true
  },

  // Subscriber SMS Template
  {
    name: 'Default Subscriber SMS',
    category: 'subscribers',
    type: 'sms',
    content: `🎉 Welcome to {{site_name}}, {{name}}!

Thank you for subscribing! You'll receive:
• Latest updates
• Exclusive announcements  
• Important news

Visit: {{website_url}}

Reply STOP to unsubscribe.`,
    variables: ['site_name', 'name', 'website_url'],
    isActive: true
  },

  // Subscriber WhatsApp Template
  {
    name: 'Default Subscriber WhatsApp',
    category: 'subscribers',
    type: 'whatsapp',
    content: `🎉 *Welcome to {{site_name}}!*

Hello *{{name}}*,

Thank you for subscribing to our newsletter! 🙏

📰 You'll now receive:
• Latest updates
• Exclusive announcements
• Important news
• Special insights

🌐 Visit our website: {{website_url}}

We're excited to have you with us! 🚀`,
    variables: ['site_name', 'name', 'website_url'],
    isActive: true
  },

  // Contact Us Email Template
  {
    name: 'Default Contact Us Email',
    category: 'contact-us',
    type: 'email',
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
    `,
    variables: ['site_name', 'first_name', 'subject', 'email', 'website_url', 'current_year'],
    isActive: true
  },

  // Contact Us SMS Template
  {
    name: 'Default Contact Us SMS',
    category: 'contact-us',
    type: 'sms',
    content: `📧 Thank you for contacting {{site_name}}, {{first_name}}!

Your message has been received. We'll respond within 30 minutes during business hours.

Subject: {{subject}}

Visit: {{website_url}}`,
    variables: ['site_name', 'first_name', 'subject', 'website_url'],
    isActive: true
  },

  // Contact Us WhatsApp Template
  {
    name: 'Default Contact Us WhatsApp',
    category: 'contact-us',
    type: 'whatsapp',
    content: `📧 *Thank you for contacting {{site_name}}!*

Hello *{{first_name}}*,

Your message has been received! ✅

📋 *Subject:* {{subject}}
🕐 *Response time:* Within 30 minutes during business hours

🌐 Visit our website: {{website_url}}

Thank you for reaching out to us! 🙏`,
    variables: ['site_name', 'first_name', 'subject', 'website_url'],
    isActive: true
  }
];

async function initializeTemplates() {
  let client;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('communication_templates');
    
    console.log('✅ Connected to MongoDB');
    console.log('🔄 Initializing default templates...');
    
    let created = 0;
    let skipped = 0;
    
    for (const template of defaultTemplates) {
      const existing = await collection.findOne({
        category: template.category,
        type: template.type,
        name: template.name
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${template.category}-${template.type} (already exists)`);
        skipped++;
      } else {
        await collection.insertOne({
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Created: ${template.category}-${template.type}`);
        created++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${created} templates`);
    console.log(`⏭️  Skipped: ${skipped} templates`);
    console.log(`📝 Total: ${defaultTemplates.length} templates processed`);
    
    if (created > 0) {
      console.log('\n🎉 Default templates initialized successfully!');
    } else {
      console.log('\n✨ All default templates already exist.');
    }
    
  } catch (error) {
    console.error('❌ Error initializing templates:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeTemplates();
}

module.exports = { initializeTemplates, defaultTemplates };