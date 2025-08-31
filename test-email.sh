#!/bin/bash

# Test Email Delivery Script
# This script tests the newsletter subscription with email delivery

echo "🧪 Testing AKY Media Newsletter Subscription Email Delivery"
echo "=========================================================="

# Test 1: Email only subscription
echo ""
echo "📧 Test 1: Email-only subscription"
echo "Subscribing test email..."

response=$(curl -s -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.akymedia@gmail.com",
    "name": "Test User",
    "source": "email-test"
  }')

echo "Response: $response"

# Test 2: Check email service status
echo ""
echo "📊 Test 2: Email service status"
curl -s http://localhost:3000/api/communication/email | jq '.message'

# Test 3: Test template system
echo ""
echo "🎨 Test 3: Template system test"
curl -s -X POST http://localhost:3000/api/communication/test-templates \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribers",
    "email": "test.akymedia@gmail.com",
    "name": "Template Test User"
  }' | jq '.data.summary'

echo ""
echo "✅ Email testing completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Check the email inbox for test.akymedia@gmail.com"
echo "2. Verify the welcome email was received"
echo "3. Check email formatting and template variables"
echo ""
echo "🔧 If emails are not received:"
echo "1. Check spam/junk folder"
echo "2. Verify SMTP configuration in .env"
echo "3. Check server logs for errors"