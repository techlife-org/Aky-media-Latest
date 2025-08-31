# 📧 Email Service Setup Guide

## 🚀 Current Configuration Status

Your email service is configured with **Hostinger SMTP** and should be working. Here's what's set up:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notify@abbakabiryusuf.info
SMTP_PASS=Abbakabir2024!
SMTP_FROM=notify@abbakabiryusuf.info
EMAIL_FROM_NAME="AKY Communication System"
```

## 🔧 How to Test Email Service

### **Method 1: Quick Test (Recommended)**
1. **Go to**: http://localhost:3001/dashboard/communication
2. **Click "Email" tab**
3. **Enter your email** in the "Recipient Email" field
4. **Click "Test Email Configuration"**
5. **Check your inbox** for the test email

### **Method 2: Custom Email Test**
1. **Fill in all email fields**:
   - **To**: your-email@example.com
   - **Subject**: Test Email from AKY
   - **Message**: Hello! This is a test email.
2. **Click "Send Custom Email"**
3. **Check your inbox**

## 📱 Expected Results

### ✅ **If Email Works:**
- Status shows "Active" with green badge
- Test email arrives in your inbox within 1-2 minutes
- Email includes HTML formatting and AKY branding
- Configuration details are displayed

### ❌ **If Email Fails:**
- Status shows "Error" with red badge
- Error message with specific details
- Troubleshooting suggestions provided

## 🔍 Common Issues & Solutions

### **1. Authentication Failed (EAUTH)**
**Problem**: Invalid username or password
**Solutions**:
- Verify `SMTP_USER` and `SMTP_PASS` in .env file
- For Hostinger: Use your email account credentials
- Check if password has special characters (escape them)

### **2. Connection Failed (ECONNECTION)**
**Problem**: Cannot connect to SMTP server
**Solutions**:
- Verify `SMTP_HOST=smtp.hostinger.com`
- Check `SMTP_PORT=465` for SSL
- Ensure `SMTP_SECURE=true` for port 465

### **3. Timeout (ETIMEDOUT)**
**Problem**: Server not responding
**Solutions**:
- Check internet connection
- Verify firewall isn't blocking port 465
- Try port 587 with `SMTP_SECURE=false`

### **4. Server Not Found (ENOTFOUND)**
**Problem**: Cannot resolve hostname
**Solutions**:
- Verify `SMTP_HOST=smtp.hostinger.com` (no typos)
- Check DNS resolution
- Try alternative: `smtp.hostinger.com`

## 🛠️ Alternative SMTP Configurations

### **Gmail (Free Alternative)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_FROM_NAME="AKY Communication System"
```

**Setup Steps**:
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use the 16-character app password (not your regular password)

### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
EMAIL_FROM_NAME="AKY Communication System"
```

## 📊 Email Service Features

### **Current Capabilities**
- ✅ **HTML Emails**: Rich formatting with CSS
- ✅ **Plain Text**: Fallback for all email clients
- ✅ **Multiple Recipients**: CC, BCC support
- ✅ **Attachments**: File attachments support
- ✅ **Custom Headers**: Professional email headers
- ✅ **Error Handling**: Detailed error messages
- ✅ **Connection Pooling**: Efficient SMTP connections

### **Email Types You Can Send**
- **Notifications**: User alerts and updates
- **Newsletters**: Marketing and announcements
- **Transactional**: Order confirmations, receipts
- **System Alerts**: Error notifications, reports
- **Custom Messages**: Any HTML/text content

## 🎯 Testing Checklist

### **Basic Test**
- [ ] Email status shows "Active"
- [ ] Test email configuration works
- [ ] Email arrives in inbox (check spam folder)
- [ ] HTML formatting displays correctly

### **Advanced Test**
- [ ] Multiple recipients work (comma-separated)
- [ ] CC and BCC functionality
- [ ] HTML content renders properly
- [ ] Attachments can be sent
- [ ] Custom subject lines work

### **Production Readiness**
- [ ] Sender name displays correctly
- [ ] From address is professional
- [ ] Email doesn't go to spam
- [ ] Delivery time is reasonable (< 5 minutes)
- [ ] Error handling works for invalid emails

## 🔐 Security Best Practices

### **Email Security**
- ✅ **TLS/SSL Encryption**: All emails encrypted in transit
- ✅ **Authentication**: SMTP authentication required
- ✅ **Connection Pooling**: Secure connection reuse
- ✅ **Error Logging**: Detailed logs for debugging

### **Credential Security**
- ✅ **Environment Variables**: Credentials stored in .env
- ✅ **No Hardcoding**: No passwords in source code
- ✅ **Masked Logging**: Passwords hidden in logs

## 📈 Performance Optimization

### **Current Settings**
- **Connection Timeout**: 60 seconds
- **Socket Timeout**: 60 seconds
- **Connection Pooling**: Enabled (5 max connections)
- **Message Limit**: 100 messages per connection

### **Monitoring**
- Connection time tracking
- Success/failure rates
- Error categorization
- Performance metrics

## 🆘 Troubleshooting Commands

### **Test SMTP Connection**
```bash
# Test if SMTP server is reachable
telnet smtp.hostinger.com 465
```

### **Check DNS Resolution**
```bash
# Verify hostname resolves
nslookup smtp.hostinger.com
```

### **Verify Environment Variables**
```bash
# Check if variables are set
echo $SMTP_HOST
echo $SMTP_USER
```

## 📞 Support Resources

### **Hostinger Support**
- **Knowledge Base**: https://support.hostinger.com
- **Email Setup Guide**: https://support.hostinger.com/en/articles/1583229-how-to-set-up-an-email-client
- **SMTP Settings**: https://support.hostinger.com/en/articles/1583229

### **General Email Issues**
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Outlook SMTP**: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353
- **Email Deliverability**: https://www.mail-tester.com

## 🎉 Success Indicators

### **Email Service is Working When:**
- ✅ Status badge shows "Active" (green)
- ✅ Test emails arrive within 2 minutes
- ✅ HTML formatting displays correctly
- ✅ No authentication errors in logs
- ✅ Multiple recipients work
- ✅ Emails don't go to spam folder

---

**Your email service should be working with the current Hostinger configuration. Test it now at the Communication Center!** 📧