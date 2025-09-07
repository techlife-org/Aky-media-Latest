/**
 * Test utility for Twilio notifications
 * This file helps test SMS and WhatsApp messaging functionality
 */

import { NotificationService } from './notification-service';

export async function testTwilioIntegration(testPhone: string, testEmail: string, testName?: string) {
  console.log('🧪 Testing Twilio Integration...');
  console.log('================================');
  
  try {
    const notificationService = new NotificationService();
    
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`📱 Test Phone: ${testPhone}`);
    console.log(`👤 Test Name: ${testName || 'Test User'}`);
    console.log('');
    
    // Test welcome notifications
    console.log('🚀 Sending welcome notifications...');
    const results = await notificationService.sendWelcomeNotifications(
      testEmail, 
      testPhone, 
      testName
    );
    
    console.log('📊 Results:');
    console.log('----------');
    
    if (results.email) {
      console.log('✅ Email sent successfully');
      console.log(`   Message ID: ${results.email.messageId}`);
    } else {
      console.log('❌ Email failed');
    }
    
    if (results.sms) {
      console.log('✅ SMS sent successfully');
      console.log(`   Message SID: ${results.sms.sid}`);
      console.log(`   Status: ${results.sms.status}`);
    } else {
      console.log('❌ SMS failed');
    }
    
    if (results.whatsapp) {
      console.log('✅ WhatsApp sent successfully');
      console.log(`   Message SID: ${results.whatsapp.sid}`);
      console.log(`   Status: ${results.whatsapp.status}`);
    } else {
      console.log('❌ WhatsApp failed');
    }
    
    if (results.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('');
    console.log('🎉 Test completed!');
    
    return results;
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    throw error;
  }
}

/**
 * Test individual SMS sending
 */
export async function testSMS(phone: string, name?: string) {
  console.log('📱 Testing SMS only...');
  
  try {
    const notificationService = new NotificationService();
    // Access the private twilioService through the public method
    const results = await notificationService.sendWelcomeNotifications('test@example.com', phone, name);
    
    if (results.sms) {
      console.log('✅ SMS test successful');
      console.log(`   SID: ${results.sms.sid}`);
      return results.sms;
    } else {
      console.log('❌ SMS test failed');
      return null;
    }
  } catch (error) {
    console.error('💥 SMS test error:', error);
    throw error;
  }
}

/**
 * Test individual WhatsApp sending
 */
export async function testWhatsApp(phone: string, name?: string) {
  console.log('💬 Testing WhatsApp only...');
  
  try {
    const notificationService = new NotificationService();
    // Access the private twilioService through the public method
    const results = await notificationService.sendWelcomeNotifications('test@example.com', phone, name);
    
    if (results.whatsapp) {
      console.log('✅ WhatsApp test successful');
      console.log(`   SID: ${results.whatsapp.sid}`);
      return results.whatsapp;
    } else {
      console.log('❌ WhatsApp test failed');
      return null;
    }
  } catch (error) {
    console.error('💥 WhatsApp test error:', error);
    throw error;
  }
}

/**
 * Validate Twilio configuration
 */
export function validateTwilioConfig() {
  console.log('🔍 Validating Twilio Configuration...');
  console.log('====================================');
  
  const config = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN ? '[HIDDEN]' : undefined,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    contentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID
  };
  
  console.log('Configuration:');
  Object.entries(config).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
  });
  
  const isValid = config.accountSid && 
                  process.env.TWILIO_AUTH_TOKEN && 
                  config.phoneNumber && 
                  config.whatsappNumber;
  
  console.log('');
  console.log(`Overall Status: ${isValid ? '✅ Valid' : '❌ Invalid - Missing required fields'}`);
  
  return isValid;
}

// Example usage (commented out):
/*
// Test with your phone number
testTwilioIntegration(
  '+2348161781643',  // Your test phone number
  'test@example.com', // Your test email
  'Test User'         // Test name
).then(() => {
  console.log('All tests completed!');
}).catch(error => {
  console.error('Tests failed:', error);
});
*/