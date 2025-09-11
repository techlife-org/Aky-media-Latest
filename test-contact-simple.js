#!/usr/bin/env node

/**
 * Simple Contact Form Test
 * Tests the contact form submission directly
 */

const fetch = require('node-fetch');

const testContactForm = async () => {
  console.log('🧪 Testing Contact Form Submission...');
  
  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    mobile: '+2348161781643',
    subject: 'Test Contact Form - Enhanced System',
    message: 'This is a test message to verify the enhanced contact form is working properly with all notifications. Please ignore this test message.'
  };
  
  console.log('📝 Test Data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:4000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    const result = await response.json();
    console.log('📋 Response Data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ Contact form test PASSED!');
      console.log('📧 Notifications sent:', result.notifications);
      console.log('🆔 Contact ID:', result.contactId);
    } else {
      console.log('❌ Contact form test FAILED!');
      console.log('💬 Error:', result.message);
      if (result.errors) {
        console.log('🚨 Errors:', result.errors);
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
};

// Run the test
testContactForm().catch(console.error);
  }
]</function_calls>

<function_calls>
<invoke name="shell_execute">
<parameter name="operation_type">EXECUTE