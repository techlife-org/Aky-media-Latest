#!/usr/bin/env node

/**
 * Comprehensive Contact System Test
 * Tests all aspects of the contact system including:
 * - Contact form submission
 * - Email notifications
 * - SMS notifications
 * - WhatsApp notifications
 * - Template system
 * - Database storage
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '+2348161781643'; // Nigerian number format

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSubSection(title) {
  log(`\n${'-'.repeat(40)}`, 'blue');
  log(`${title}`, 'blue');
  log(`${'-'.repeat(40)}`, 'blue');
}

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
      response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

async function testCommunicationServices() {
  logSection('TESTING COMMUNICATION SERVICES');

  // Test Email Service
  logSubSection('Email Service Status');
  const emailStatus = await testAPI('/api/communication/email');
  if (emailStatus.success) {
    log('✅ Email service is configured and working', 'green');
    log(`   Provider: ${emailStatus.data.provider || 'SMTP'}`, 'green');
    log(`   Status: ${emailStatus.data.status}`, 'green');
    if (emailStatus.data.configuration) {
      log(`   Host: ${emailStatus.data.configuration.host}`, 'green');
      log(`   Port: ${emailStatus.data.configuration.port}`, 'green');
      log(`   User: ${emailStatus.data.configuration.user}`, 'green');
    }
  } else {
    log('❌ Email service is not configured properly', 'red');
    log(`   Error: ${emailStatus.data?.error || emailStatus.error}`, 'red');
    if (emailStatus.data?.missing) {
      log(`   Missing: ${emailStatus.data.missing.join(', ')}`, 'yellow');
    }
  }

  // Test SMS Service
  logSubSection('SMS Service Status');
  const smsStatus = await testAPI('/api/communication/sms');
  if (smsStatus.success) {
    log('✅ SMS service is configured and working', 'green');
    log(`   Provider: ${smsStatus.data.service || 'Termii'}`, 'green');
    log(`   Status: ${smsStatus.data.status}`, 'green');
    if (smsStatus.data.account) {
      log(`   Balance: ${smsStatus.data.account.currency} ${smsStatus.data.account.balance}`, 'green');
      log(`   Estimated SMS: ${smsStatus.data.account.estimatedSmsCount || 'N/A'}`, 'green');
    }
  } else {
    log('❌ SMS service is not configured properly', 'red');
    log(`   Error: ${smsStatus.data?.error || smsStatus.error}`, 'red');
  }

  // Test WhatsApp Service
  logSubSection('WhatsApp Service Status');
  const whatsappStatus = await testAPI('/api/communication/whatsapp');
  if (whatsappStatus.success) {
    log('✅ WhatsApp service is configured and working', 'green');
    log(`   Provider: ${whatsappStatus.data.service || 'Termii'}`, 'green');
    log(`   Status: ${whatsappStatus.data.status}`, 'green');
    if (whatsappStatus.data.account) {
      log(`   Balance: ${whatsappStatus.data.account.currency} ${whatsappStatus.data.account.balance}`, 'green');
    }
  } else {
    log('❌ WhatsApp service is not configured properly', 'red');
    log(`   Error: ${whatsappStatus.data?.error || whatsappStatus.error}`, 'red');
  }

  return {
    email: emailStatus.success,
    sms: smsStatus.success,
    whatsapp: whatsappStatus.success
  };
}

async function testContactFormSubmission() {
  logSection('TESTING CONTACT FORM SUBMISSION');

  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: TEST_EMAIL,
    mobile: TEST_PHONE,
    subject: 'Test Contact Form Submission',
    message: 'This is a test message to verify the contact form is working properly. Please ignore this message.'
  };

  log('Submitting test contact form...', 'yellow');
  log(`Data: ${JSON.stringify(testData, null, 2)}`, 'blue');

  const result = await testAPI('/api/contact', 'POST', testData);

  if (result.success) {
    log('✅ Contact form submission successful', 'green');
    log(`   Message: ${result.data.message}`, 'green');
    if (result.data.success) {
      log('✅ Contact message saved to database', 'green');
    }
  } else {
    log('❌ Contact form submission failed', 'red');
    log(`   Error: ${result.data?.message || result.error}`, 'red');
    log(`   Status: ${result.status}`, 'red');
  }

  return result.success;
}

async function testEmailNotification() {
  logSection('TESTING EMAIL NOTIFICATION');

  const emailData = {
    to: TEST_EMAIL,
    subject: 'Test Email from AKY Contact System',
    message: 'This is a test email to verify the email notification system is working.',
    html: `
      <h2>Test Email from AKY Contact System</h2>
      <p>This is a test email to verify the email notification system is working.</p>
      <p>If you receive this email, the system is functioning correctly.</p>
      <p>Best regards,<br>AKY Digital Team</p>
    `
  };

  log('Sending test email...', 'yellow');
  const result = await testAPI('/api/communication/email', 'POST', emailData);

  if (result.success) {
    log('✅ Email sent successfully', 'green');
    log(`   Message ID: ${result.data.data?.messageId || 'N/A'}`, 'green');
    log(`   Provider: ${result.data.data?.provider || 'N/A'}`, 'green');
  } else {
    log('❌ Email sending failed', 'red');
    log(`   Error: ${result.data?.error || result.error}`, 'red');
  }

  return result.success;
}

async function testSMSNotification() {
  logSection('TESTING SMS NOTIFICATION');

  const smsData = {
    to: TEST_PHONE,
    message: 'Test SMS from AKY Contact System. This is a test message to verify SMS functionality is working. Please ignore.'
  };

  log('Sending test SMS...', 'yellow');
  const result = await testAPI('/api/communication/sms', 'POST', smsData);

  if (result.success) {
    log('✅ SMS sent successfully', 'green');
    log(`   Message ID: ${result.data.data?.messageId || 'N/A'}`, 'green');
    log(`   Provider: ${result.data.data?.provider || 'N/A'}`, 'green');
    log(`   Recipients: ${result.data.data?.successCount || 0}`, 'green');
  } else {
    log('❌ SMS sending failed', 'red');
    log(`   Error: ${result.data?.error || result.error}`, 'red');
  }

  return result.success;
}

async function testWhatsAppNotification() {
  logSection('TESTING WHATSAPP NOTIFICATION');

  const whatsappData = {
    to: TEST_PHONE,
    message: 'Test WhatsApp message from AKY Contact System. This is a test message to verify WhatsApp functionality is working. Please ignore.',
    type: 'text'
  };

  log('Sending test WhatsApp message...', 'yellow');
  const result = await testAPI('/api/communication/whatsapp', 'POST', whatsappData);

  if (result.success) {
    log('✅ WhatsApp message sent successfully', 'green');
    log(`   Message ID: ${result.data.data?.messageId || 'N/A'}`, 'green');
    log(`   Provider: ${result.data.data?.provider || 'N/A'}`, 'green');
    log(`   Recipients: ${result.data.data?.successCount || 0}`, 'green');
  } else {
    log('❌ WhatsApp message sending failed', 'red');
    log(`   Error: ${result.data?.error || result.error}`, 'red');
  }

  return result.success;
}

async function testTemplateSystem() {
  logSection('TESTING TEMPLATE SYSTEM');

  // Test template initialization
  logSubSection('Template Initialization');
  const initResult = await testAPI('/api/communication/templates/initialize', 'POST');
  
  if (initResult.success) {
    log('✅ Templates initialized successfully', 'green');
  } else {
    log('❌ Template initialization failed', 'red');
    log(`   Error: ${initResult.data?.error || initResult.error}`, 'red');
  }

  // Test template retrieval
  logSubSection('Template Retrieval');
  const templateResult = await testAPI('/api/communication/templates');
  
  if (templateResult.success) {
    log('✅ Templates retrieved successfully', 'green');
    if (templateResult.data.templates) {
      log(`   Total templates: ${templateResult.data.templates.length}`, 'green');
      templateResult.data.templates.forEach(template => {
        log(`   - ${template.category}-${template.type}: ${template.name}`, 'blue');
      });
    }
  } else {
    log('❌ Template retrieval failed', 'red');
    log(`   Error: ${templateResult.data?.error || templateResult.error}`, 'red');
  }

  return initResult.success && templateResult.success;
}

async function generateReport(results) {
  logSection('COMPREHENSIVE TEST REPORT');

  const timestamp = new Date().toISOString();
  
  log(`Test completed at: ${timestamp}`, 'cyan');
  log('', 'reset');

  // Service Status
  log('📊 SERVICE STATUS:', 'bright');
  log(`   Email Service: ${results.services.email ? '✅ Working' : '❌ Failed'}`, results.services.email ? 'green' : 'red');
  log(`   SMS Service: ${results.services.sms ? '✅ Working' : '❌ Failed'}`, results.services.sms ? 'green' : 'red');
  log(`   WhatsApp Service: ${results.services.whatsapp ? '✅ Working' : '❌ Failed'}`, results.services.whatsapp ? 'green' : 'red');
  log('', 'reset');

  // Functionality Tests
  log('🧪 FUNCTIONALITY TESTS:', 'bright');
  log(`   Contact Form: ${results.contactForm ? '✅ Working' : '❌ Failed'}`, results.contactForm ? 'green' : 'red');
  log(`   Email Notifications: ${results.emailNotification ? '✅ Working' : '❌ Failed'}`, results.emailNotification ? 'green' : 'red');
  log(`   SMS Notifications: ${results.smsNotification ? '✅ Working' : '❌ Failed'}`, results.smsNotification ? 'green' : 'red');
  log(`   WhatsApp Notifications: ${results.whatsappNotification ? '✅ Working' : '❌ Failed'}`, results.whatsappNotification ? 'green' : 'red');
  log(`   Template System: ${results.templateSystem ? '✅ Working' : '❌ Failed'}`, results.templateSystem ? 'green' : 'red');
  log('', 'reset');

  // Overall Status
  const totalTests = Object.keys(results).length - 1; // Exclude 'services' object
  const passedTests = Object.values(results).filter(result => {
    if (typeof result === 'object') {
      return Object.values(result).every(val => val === true);
    }
    return result === true;
  }).length;

  const overallSuccess = passedTests === totalTests;
  
  log('📈 OVERALL STATUS:', 'bright');
  log(`   Tests Passed: ${passedTests}/${totalTests}`, overallSuccess ? 'green' : 'yellow');
  log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, overallSuccess ? 'green' : 'yellow');
  log(`   Status: ${overallSuccess ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️  SOME ISSUES DETECTED'}`, overallSuccess ? 'green' : 'yellow');

  // Recommendations
  if (!overallSuccess) {
    log('', 'reset');
    log('🔧 RECOMMENDATIONS:', 'yellow');
    
    if (!results.services.email) {
      log('   • Configure SMTP settings in .env file', 'yellow');
      log('   • Check SMTP_HOST, SMTP_USER, SMTP_PASS variables', 'yellow');
    }
    
    if (!results.services.sms) {
      log('   • Add TERMII_API_KEY to .env file', 'yellow');
      log('   • Sign up at https://termii.com/ and complete verification', 'yellow');
    }
    
    if (!results.services.whatsapp) {
      log('   • Ensure TERMII_API_KEY is configured for WhatsApp', 'yellow');
      log('   • Check Termii account for WhatsApp service activation', 'yellow');
    }
    
    if (!results.contactForm) {
      log('   • Check database connection (MongoDB)', 'yellow');
      log('   • Verify API route is accessible', 'yellow');
    }
  }

  // Save report to file
  const reportData = {
    timestamp,
    baseUrl: BASE_URL,
    testEmail: TEST_EMAIL,
    testPhone: TEST_PHONE,
    results,
    summary: {
      totalTests,
      passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      overallSuccess
    }
  };

  const reportPath = path.join(__dirname, `contact-system-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  log('', 'reset');
  log(`📄 Detailed report saved to: ${reportPath}`, 'cyan');
}

async function main() {
  log('🚀 Starting Comprehensive Contact System Test', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Test Email: ${TEST_EMAIL}`, 'blue');
  log(`Test Phone: ${TEST_PHONE}`, 'blue');

  const results = {};

  try {
    // Test communication services
    results.services = await testCommunicationServices();

    // Test contact form submission
    results.contactForm = await testContactFormSubmission();

    // Test individual notification systems
    results.emailNotification = await testEmailNotification();
    results.smsNotification = await testSMSNotification();
    results.whatsappNotification = await testWhatsAppNotification();

    // Test template system
    results.templateSystem = await testTemplateSystem();

    // Generate comprehensive report
    await generateReport(results);

  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testCommunicationServices,
  testContactFormSubmission,
  testEmailNotification,
  testSMSNotification,
  testWhatsAppNotification,
  testTemplateSystem
};