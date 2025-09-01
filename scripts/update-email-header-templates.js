#!/usr/bin/env node

const { MongoClient } = require('mongodb');

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'akywebsite';

async function updateEmailHeaderTemplates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('communication_templates');

    console.log('🎨 Updating Email Templates with Enhanced Header Image Background...');

    // Enhanced News Email Template with improved image handling
    const newsEmailTemplate = {
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
    <!-- Header with Enhanced Background Image Handling -->
    <div class="header" style="
      background: 
        linear-gradient(135deg, rgba(220, 38, 38, 0.85) 0%, rgba(185, 28, 28, 0.85) 100%), 
        url('{{website_url}}/email-header.png'),
        url('https://abbakabiryusuf.info/email-header.png'),
        linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      background-size: cover, cover, cover, auto;
      background-position: center, center, center, center;
      background-repeat: no-repeat, no-repeat, no-repeat, repeat;
      background-blend-mode: overlay;
      padding: 50px 40px; 
      text-align: center; 
      position: relative;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="position: relative; z-index: 3;">
        <h1 class="title" style="margin: 0; font-size: 36px; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); letter-spacing: -0.5px;">🚨 Breaking News</h1>
        <p class="subtitle" style="margin: 15px 0 0 0; font-size: 20px; color: white; opacity: 0.95; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">The AKY Digital Team</p>
      </div>
      <!-- Enhanced Decorative Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6; z-index: 1;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4; z-index: 1;"></div>
      <div style="position: absolute; top: 50%; left: 10px; width: 20px; height: 20px; background: rgba(255,255,255,0.08); border-radius: 50%; opacity: 0.5; z-index: 1;"></div>
      <div style="position: absolute; top: 30%; right: 50px; width: 30px; height: 30px; background: rgba(255,255,255,0.06); border-radius: 50%; opacity: 0.3; z-index: 1;"></div>
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
      `,
      variables: ['name', 'news_title', 'news_content', 'news_category', 'news_url', 'website_url', 'current_year', 'unsubscribe_url']
    };

    // Enhanced Achievement Email Template with improved image handling
    const achievementEmailTemplate = {
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
    <!-- Header with Enhanced Background Image Handling -->
    <div class="header" style="
      background: 
        linear-gradient(135deg, rgba(220, 38, 38, 0.85) 0%, rgba(185, 28, 28, 0.85) 100%), 
        url('{{website_url}}/email-header.png'),
        url('https://abbakabiryusuf.info/email-header.png'),
        linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      background-size: cover, cover, cover, auto;
      background-position: center, center, center, center;
      background-repeat: no-repeat, no-repeat, no-repeat, repeat;
      background-blend-mode: overlay;
      padding: 50px 40px; 
      text-align: center; 
      position: relative;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="position: relative; z-index: 3;">
        <h1 class="title" style="margin: 0; font-size: 36px; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); letter-spacing: -0.5px;">🏆 Major Achievement</h1>
        <p class="subtitle" style="margin: 15px 0 0 0; font-size: 20px; color: white; opacity: 0.95; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">The AKY Digital Team</p>
      </div>
      <!-- Enhanced Decorative Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6; z-index: 1;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4; z-index: 1;"></div>
      <div style="position: absolute; top: 50%; left: 10px; width: 20px; height: 20px; background: rgba(255,255,255,0.08); border-radius: 50%; opacity: 0.5; z-index: 1;"></div>
      <div style="position: absolute; top: 30%; right: 50px; width: 30px; height: 30px; background: rgba(255,255,255,0.06); border-radius: 50%; opacity: 0.3; z-index: 1;"></div>
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
      `,
      variables: ['name', 'achievement_title', 'achievement_description', 'achievement_category', 'achievement_location', 'achievement_date', 'achievement_progress', 'achievement_url', 'website_url', 'current_year', 'unsubscribe_url']
    };

    // Update News Email Template
    const newsResult = await collection.updateOne(
      { category: 'news', type: 'email', name: 'AKY Digital News Email' },
      {
        $set: {
          ...newsEmailTemplate,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (newsResult.upsertedCount > 0) {
      console.log('✅ Created new News Email template with enhanced header image');
    } else if (newsResult.modifiedCount > 0) {
      console.log('✅ Updated existing News Email template with enhanced header image');
    } else {
      console.log('⚠️  News Email template already up to date');
    }

    // Update Achievement Email Template
    const achievementResult = await collection.updateOne(
      { category: 'achievements', type: 'email', name: 'AKY Digital Achievement Email' },
      {
        $set: {
          ...achievementEmailTemplate,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (achievementResult.upsertedCount > 0) {
      console.log('✅ Created new Achievement Email template with enhanced header image');
    } else if (achievementResult.modifiedCount > 0) {
      console.log('✅ Updated existing Achievement Email template with enhanced header image');
    } else {
      console.log('⚠️  Achievement Email template already up to date');
    }

    console.log('\\n🎉 Email templates updated successfully with enhanced header image background!');
    console.log('\\n📧 Enhanced Features:');
    console.log('  • ✅ Primary image source: {{website_url}}/email-header.png');
    console.log('  • ✅ Fallback image source: https://abbakabiryusuf.info/email-header.png');
    console.log('  • ✅ Final fallback: Red gradient background');
    console.log('  • ✅ Enhanced overlay for better text readability');
    console.log('  • ✅ Improved responsive design');
    console.log('  • ✅ Better image positioning and sizing');
    console.log('  • ✅ Enhanced decorative elements');
    console.log('  • ✅ Stronger text shadows for visibility');
    console.log('  • ✅ Works in both local and production environments');
    
  } catch (error) {
    console.error('❌ Error updating email header templates:', error);
  } finally {
    await client.close();
  }
}

updateEmailHeaderTemplates();