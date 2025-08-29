# Email Setup Guide for AKY Communication System

This guide will help you set up email functionality with proper SMTP configuration for the AKY Communication System.

## Quick Setup

1. **Choose your email provider** (Gmail recommended)
2. **Copy the appropriate configuration** to your `.env` file
3. **Test the configuration** using the dashboard
4. **Send your first email**

## Supported Email Providers

### 🟢 Gmail (Recommended)

**Why Gmail?**
- Reliable delivery
- High sending limits
- Easy App Password setup
- Excellent spam filtering

**Setup Steps:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to: https://support.google.com/accounts/answer/185833
   - Select "Mail" as the app
   - Copy the 16-character password
3. Add to your `.env` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_FROM_NAME="AKY Communication System"
```

### 🟡 Outlook/Hotmail

**Setup Steps:**
1. Use your regular Outlook password (no App Password needed)
2. Add to your `.env` file:

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
EMAIL_FROM_NAME="AKY Communication System"
```

### 🟡 Yahoo Mail

**Setup Steps:**
1. Generate an App Password:
   - Go to: https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html
   - Create a new app password
2. Add to your `.env` file:

```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
EMAIL_FROM_NAME="AKY Communication System"
```

### 🔵 Custom SMTP Server

For other email providers or custom SMTP servers:

```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=your-from-email@domain.com
EMAIL_FROM_NAME="Your Organization Name"
```

## Configuration Options

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `false` for port 587, `true` for port 465 |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | App password or regular password |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_FROM` | Default sender email | Uses `SMTP_USER` |
| `EMAIL_FROM_NAME` | Sender display name | `"AKY Communication"` |
| `SMTP_USERNAME` | Alternative to `SMTP_USER` | - |
| `SMTP_PASSWORD` | Alternative to `SMTP_PASS` | - |
| `EMAIL_FROM` | Alternative to `SMTP_FROM` | - |

## Testing Your Configuration

### 1. Check Service Status

Visit: `http://localhost:3000/api/communication/email`

**Expected Response (Success):**
```json
{
  "success": true,
  "service": "Email (SMTP)",
  "status": "active",
  "configuration": {
    "host": "smtp.gmail.com",
    "port": "587",
    "secure": false,
    "user": "you***",
    "from": "your-email@gmail.com"
  },
  "message": "Email service is ready and verified"
}
```

### 2. Use the Dashboard

1. Go to: `http://localhost:3000/dashboard/communication`
2. Click the "Email" tab
3. Fill in the test form:
   - **To**: Your email address
   - **Subject**: "Test Email from AKY"
   - **Message**: "Hello, this is a test email!"
4. Click "Send Email"

### 3. Send via API

```bash
curl -X POST http://localhost:3000/api/communication/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from AKY",
    "message": "Hello, this is a test email from the AKY Communication Center."
  }'
```

## Common Issues & Solutions

### ❌ EAUTH - Authentication Failed

**Problem**: Wrong username or password

**Solutions:**
- **Gmail**: Use App Password, not regular password
- **Yahoo**: Generate App Password
- **Outlook**: Try regular password first
- Check username is complete email address

### ❌ ECONNECTION - Connection Failed

**Problem**: Cannot connect to SMTP server

**Solutions:**
- Check `SMTP_HOST` spelling
- Verify `SMTP_PORT` (587 for TLS, 465 for SSL)
- Check firewall settings
- Try different port if blocked

### ❌ ETIMEDOUT - Connection Timeout

**Problem**: Server took too long to respond

**Solutions:**
- Check internet connectivity
- Try different SMTP server
- Contact your ISP (some block SMTP)

### ❌ ENOTFOUND - Server Not Found

**Problem**: Cannot resolve SMTP hostname

**Solutions:**
- Check `SMTP_HOST` spelling
- Verify DNS settings
- Try using IP address instead

## Advanced Configuration

### HTML Email Templates

```javascript
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #f4f4f4; padding: 20px; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AKY Communication</h1>
    </div>
    <div class="content">
        <p>Hello,</p>
        <p>This is a professional email template.</p>
        <p>Best regards,<br>AKY Team</p>
    </div>
</body>
</html>
`;
```

### Email with Attachments

```json
{
  "to": "user@example.com",
  "subject": "Document Attached",
  "message": "Please find the attached document.",
  "attachments": [
    {
      "filename": "report.pdf",
      "path": "/path/to/report.pdf",
      "contentType": "application/pdf"
    }
  ]
}
```

### Bulk Email with CC/BCC

```json
{
  "to": ["user1@example.com", "user2@example.com"],
  "cc": ["manager@example.com"],
  "bcc": ["archive@example.com"],
  "subject": "Newsletter Update",
  "message": "Monthly newsletter content...",
  "html": "<h2>Newsletter</h2><p>Content...</p>"
}
```

## Security Best Practices

1. **Use App Passwords** instead of regular passwords
2. **Enable 2FA** on your email account
3. **Store credentials securely** in environment variables
4. **Use TLS encryption** (port 587)
5. **Monitor sending limits** to avoid being blocked
6. **Validate email addresses** before sending
7. **Implement rate limiting** for production use

## Sending Limits

| Provider | Daily Limit | Per Hour |
|----------|-------------|----------|
| Gmail | 500 | 100 |
| Outlook | 300 | 30 |
| Yahoo | 500 | 100 |

## Production Considerations

1. **Use dedicated email service** for high volume:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Implement email queue** for bulk sending
3. **Add unsubscribe links** for newsletters
4. **Monitor bounce rates** and spam complaints
5. **Use proper SPF/DKIM records** for better deliverability

## Support

If you encounter issues:

1. Check the API status endpoint: `/api/communication/email`
2. Review the error logs in the console
3. Test with a simple email first
4. Verify your email provider's SMTP settings
5. Contact your email provider's support if needed

For more help, refer to the main [Communication API Documentation](COMMUNICATION_API.md).