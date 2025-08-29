# Communication API Documentation

This document describes the communication API endpoints for WhatsApp, SMS, and Email services.

## Overview

The communication system supports three channels:
- **WhatsApp** via Twilio
- **SMS** via Infobip
- **Email** via SMTP (Nodemailer)

## Environment Variables

Copy `.env.communication.example` to your `.env` file and configure:

```bash
# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Infobip (SMS)
INFOBIP_API_KEY=your_api_key
INFOBIP_FROM=your_sender_number

# SMTP (Email) - Choose one provider

# Gmail (Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_FROM_NAME="AKY Communication"

# Outlook/Hotmail
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@outlook.com
# SMTP_PASS=your-password

# Yahoo
# SMTP_HOST=smtp.mail.yahoo.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@yahoo.com
# SMTP_PASS=your-app-password

# Hostinger
# SMTP_HOST=smtp.hostinger.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=your-email@yourdomain.com
# SMTP_PASS=your-email-password
```

## API Endpoints

### WhatsApp API

#### Send WhatsApp Message
```
POST /api/communication/whatsapp
```

**Request Body:**
```json
{
  "to": "+2348161781643",
  "message": "Your appointment is coming up on July 21 at 3PM"
}
```

**Or with Template:**
```json
{
  "to": "+2348161781643",
  "templateSid": "HXb5b62575e6e4ff6129ad7c8efe1f983e",
  "templateVariables": "{\"1\":\"12/1\",\"2\":\"3pm\"}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageSid": "SM...",
    "status": "queued",
    "to": "whatsapp:+2348161781643",
    "from": "whatsapp:+14155238886",
    "sentAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "WhatsApp message sent successfully"
}
```

#### Check WhatsApp Service Status
```
GET /api/communication/whatsapp
```

### SMS API

#### Send SMS (Single or Bulk)
```
POST /api/communication/sms
```

**Single SMS:**
```json
{
  "to": "+2348161781643",
  "message": "Congratulations on sending your first message. Go ahead and check the delivery report in the next step.",
  "from": "447491163443"
}
```

**Bulk SMS:**
```json
{
  "to": ["+2348161781643", "+2347880234567"],
  "message": "Congratulations on sending your first message. Go ahead and check the delivery report in the next step.",
  "from": "447491163443"
}
```

**Note:** Phone numbers are automatically formatted to international format. You can use:
- International format: `+2348161781643`
- Nigerian local format: `08161781643` (automatically converted to +234)
- Without country code: `8161781643` (automatically adds +234 for Nigerian numbers)

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_id_123",
    "balance": "1000.00",
    "recipients": ["2347880234567"],
    "type": "single",
    "sentAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "SMS sent successfully to 1 recipient(s)"
}
```

#### Check SMS Service Status
```
GET /api/communication/sms
```

### Email API

#### Send Email
```
POST /api/communication/email
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Test Email from AKY",
  "message": "Hello,\n\nThis is a test email from the AKY Communication Center.\n\nBest regards,\nAKY Team",
  "html": "<h1>AKY Communication Test</h1><p>This is a <strong>test email</strong> with HTML formatting.</p>"
}
```

**Multiple Recipients with CC/BCC:**
```json
{
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Newsletter Update",
  "message": "Hello,\n\nHere's our latest newsletter update.\n\nBest regards,\nAKY Team",
  "html": "<h2>Newsletter Update</h2><p>Here's our latest newsletter update.</p>",
  "cc": ["manager@example.com"],
  "bcc": ["archive@example.com"],
  "from": "newsletter@akywebsite.com"
}
```

**With Attachments:**
```json
{
  "to": "user@example.com",
  "subject": "Document Attached",
  "message": "Please find the attached document.",
  "attachments": [
    {
      "filename": "document.pdf",
      "path": "/path/to/document.pdf",
      "contentType": "application/pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "<msg_id@domain.com>",
    "recipients": ["user@example.com"],
    "subject": "Test Email",
    "sentAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Email sent successfully to 1 recipient(s)"
}
```

#### Check Email Service Status
```
GET /api/communication/email
```

### Test API

#### Test All Services
```
POST /api/communication/test
```

**Request Body:**
```json
{
  "service": "all",
  "testData": {
    "whatsapp": {
      "to": "+2348161781643",
      "message": "Test WhatsApp message"
    },
    "sms": {
      "to": "+2348161781643",
      "message": "Test SMS message"
    },
    "email": {
      "to": "test@example.com",
      "subject": "Test Email from AKY",
      "message": "Hello, this is a test email from AKY Communication Center.",
      "html": "<h1>Test Email</h1><p>This is a test email with HTML formatting.</p>"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  },
  "results": {
    "whatsapp": { "success": true, "data": {...} },
    "sms": { "success": true, "data": {...} },
    "email": { "success": true, "data": {...} }
  }
}
```

#### Check All Services Status
```
GET /api/communication/test
```

## Admin Dashboard

Access the communication testing interface at:
```
/dashboard/communication
```

Features:
- Test individual services (WhatsApp, SMS, Email)
- Test all services simultaneously
- View service health status
- Real-time testing with results display
- Support for both single and bulk messaging

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication errors)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Usage Examples

### JavaScript/TypeScript

```typescript
// Send WhatsApp message
const response = await fetch('/api/communication/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+2348161781643',
    message: 'Hello from WhatsApp!'
  })
});

const result = await response.json();
console.log(result);
```

### cURL

```bash
# Send SMS
curl -X POST http://localhost:3000/api/communication/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+2348161781643",
    "message": "Hello from SMS!"
  }'
```

## Security Notes

- All API keys should be stored securely in environment variables
- Never expose API keys in client-side code
- Use HTTPS in production
- Implement rate limiting for production use
- Validate and sanitize all input data

## Troubleshooting

### WhatsApp Issues
- Verify Twilio credentials
- Check WhatsApp Business API approval status
- Ensure phone numbers are in correct format

### SMS Issues
- Verify Infobip API key and account balance
- Check sender number approval status
- Ensure phone numbers are in correct international format (+234XXXXXXXXXX)
- Common errors:
  - "REJECTED_PREFIX_MISSING": Phone number missing country code (automatically fixed by API)
  - "Mobile operator not found": Invalid phone number format
  - Use +234 for Nigerian numbers, +1 for US, +44 for UK, etc.

### Email Issues

**Common SMTP Errors:**
- **EAUTH**: Wrong username/password
  - For Gmail: Use App Password, not regular password
  - For Yahoo: Generate App Password
  - For Outlook: Regular password usually works

- **ECONNECTION**: Cannot connect to SMTP server
  - Check SMTP host and port settings
  - Verify firewall allows SMTP traffic
  - Try different ports (587 for TLS, 465 for SSL)

- **ETIMEDOUT**: Connection timeout
  - Network connectivity issues
  - SMTP server overloaded
  - Try increasing timeout settings

- **ENOTFOUND**: SMTP server not found
  - Check SMTP hostname spelling
  - Verify DNS resolution

**Provider-Specific Setup:**

**Gmail:**
1. Enable 2-factor authentication
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use smtp.gmail.com:587 with SMTP_SECURE=false

**Outlook/Hotmail:**
1. Use smtp-mail.outlook.com:587
2. Regular password usually works
3. Enable SMTP in account settings if needed

**Yahoo:**
1. Generate App Password: https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html
2. Use smtp.mail.yahoo.com:587

**Testing SMTP:**
- Use GET /api/communication/email to check configuration
- Check logs for detailed error messages
- Test with simple email first, then add complexity

For more help, check the service status endpoints or contact support.