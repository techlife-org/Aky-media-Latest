# 🚀 Complete Communication Services Setup Guide

## 📋 **Overview**

Your AKY Media project now uses **professional communication services** that accept **Naira payments**:

- **WhatsApp**: Termii WhatsApp Business API (₦8-12/message)
- **SMS**: Termii SMS Service (₦2.50-4/message)  
- **Email**: SMTP (Gmail/Outlook/etc) - FREE

---

## 🎯 **Step 1: Termii Account Setup**

### **Sign Up & Verification**
1. **Create Account**: https://accounts.termii.com/register
2. **Verify Email**: Check your email and verify account
3. **Business Verification**: Upload business documents (required for WhatsApp API)
4. **Phone Verification**: Verify your phone number

### **Enable Services**
1. **Login**: https://accounts.termii.com
2. **SMS Service**: Automatically enabled
3. **WhatsApp Business API**: 
   - Go to WhatsApp section in dashboard
   - Apply for WhatsApp Business API access
   - Wait for approval (usually 1-3 business days)

### **Get API Credentials**
1. **API Key**: Go to Settings → API Keys → Copy your API key
2. **Sender IDs**: 
   - SMS Sender ID: Create/use existing sender ID
   - WhatsApp Sender ID: Will be provided after approval

---

## 🎯 **Step 2: Email Service Setup**

### **Option A: Gmail (Recommended)**
1. **Enable 2FA**: Go to Google Account → Security → 2-Step Verification
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select \"Mail\" → Generate password
   - Copy the 16-character password

### **Option B: Outlook/Hotmail**
1. **Enable SMTP**: Usually enabled by default
2. **Use Regular Password**: Your normal Outlook password works

### **Option C: Other Providers**
- **Yahoo**: Generate App Password similar to Gmail
- **Hostinger**: Use your domain email credentials
- **Custom SMTP**: Get settings from your email provider

---

## 🎯 **Step 3: Environment Configuration**

### **Create/Update .env File**
```env
# Termii Configuration (Both SMS and WhatsApp)
TERMII_API_KEY=your_termii_api_key_here
TERMII_SENDER_ID=AKY Digital Hub
TERMII_WHATSAPP_SENDER_ID=AKY Media

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_FROM_NAME=\"AKY Communication System\"

# Database and other existing configs...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# ... keep your existing variables
```

### **Alternative Email Providers**
```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password

# Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
```

---

## 🎯 **Step 4: Installation & Testing**

### **Clean Installation**
```bash
# Navigate to your project
cd /path/to/Aky-media-Latest

# Remove old WhatsApp Web dependencies (if any)
npm uninstall whatsapp-web.js qrcode-terminal qrcode

# Install/update all dependencies
npm install

# Start the development server
npm run dev
```

### **Test the Services**
1. **Open Dashboard**: http://localhost:3000/dashboard/communication
2. **Check Service Status**: All services should show as \"Active\" or \"Available\"
3. **Test Each Service**:
   - **WhatsApp**: Enter phone number and message, click Send
   - **SMS**: Enter phone number and message, click Send  
   - **Email**: Enter email, subject, and message, click Send

---

## 🎯 **Step 5: Add Funds to Termii**

### **Payment Methods**
- **Bank Transfer**: Nigerian banks
- **Debit Card**: Naira cards
- **USSD Payment**: *737# codes
- **Online Banking**: Internet banking
- **Mobile Money**: Various mobile money services

### **Recommended Starting Amounts**
- **Small Business**: ₦10,000 (~800 WhatsApp + 2,500 SMS)
- **Medium Business**: ₦25,000 (~2,000 WhatsApp + 6,250 SMS)
- **Large Business**: ₦50,000+ (~4,000+ WhatsApp + 12,500+ SMS)

### **How to Add Funds**
1. **Login**: https://accounts.termii.com
2. **Billing**: Go to Billing/Wallet section
3. **Add Funds**: Choose payment method
4. **Amount**: Enter amount in Naira
5. **Pay**: Complete payment process

---

## 🎯 **Step 6: Verification & Go Live**

### **Test Messages**
```bash
# Test WhatsApp (replace with your phone number)
curl -X POST http://localhost:3000/api/communication/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+2348161781643",
    "message": "Hello! This is a test message from AKY Media communication system."
  }'

# Test SMS
curl -X POST http://localhost:3000/api/communication/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+2348161781643", 
    "message": "Hello! This is a test SMS from AKY Media."
  }'

# Test Email
curl -X POST http://localhost:3000/api/communication/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email from AKY Media",
    "message": "Hello! This is a test email from AKY Media communication system."
  }'
```

### **Check Service Status**
```bash
# Check all services
curl http://localhost:3000/api/communication/test
```

---

## 🎯 **Step 7: Production Deployment**

### **Environment Variables for Production**
```env
# Production settings
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Keep all communication settings the same
TERMII_API_KEY=your_termii_api_key_here
TERMII_SENDER_ID=AKY Media
TERMII_WHATSAPP_SENDER_ID=AKY Media

# Email settings (same as development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_FROM_NAME=\"AKY Communication System\"
```

### **Build & Deploy**
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **Termii API Issues**
- **\"API key not configured\"**: Check TERMII_API_KEY in .env file
- **\"Insufficient balance\"**: Add funds to your Termii account
- **\"WhatsApp API not enabled\"**: Apply for WhatsApp Business API access
- **\"Invalid phone number\"**: Use international format (+234...)

#### **Email Issues**
- **Gmail \"Authentication failed\"**: Use App Password, not regular password
- **Outlook connection issues**: Try port 587 with SMTP_SECURE=false
- **Yahoo authentication**: Generate App Password in Yahoo settings
- **Connection timeout**: Check firewall and SMTP settings

#### **General Issues**
- **Services showing as \"Error\"**: Check environment variables
- **Dashboard not loading**: Restart development server
- **API calls failing**: Check console logs for detailed errors

### **Getting Help**
- **Termii Support**: https://termii.com/contact
- **Termii Documentation**: https://developers.termii.com
- **Gmail SMTP Help**: https://support.google.com/accounts/answer/185833
- **Project Issues**: Check browser console and server logs

---

## 📊 **Service Monitoring**

### **Dashboard Features**
- **Real-time Status**: All services show current status
- **Balance Monitoring**: Termii account balance display
- **Health Percentage**: Overall system health indicator
- **Test Interface**: Send test messages directly from dashboard

### **API Endpoints for Monitoring**
```
GET /api/communication/test          # Overall system health
GET /api/communication/whatsapp      # WhatsApp service status
GET /api/communication/sms           # SMS service status  
GET /api/communication/email         # Email service status
```

---

## 🎉 **Success Checklist**

### ✅ **Setup Complete When:**
- [ ] Termii account created and verified
- [ ] WhatsApp Business API approved and enabled
- [ ] API key added to .env file
- [ ] Email SMTP configured and tested
- [ ] All services show \"Active\" in dashboard
- [ ] Test messages sent successfully
- [ ] Funds added to Termii account
- [ ] Production environment configured

### ✅ **Ready for Production When:**
- [ ] All test messages delivered successfully
- [ ] Dashboard shows 100% health
- [ ] Error handling tested
- [ ] Sufficient funds in Termii account
- [ ] Email delivery confirmed
- [ ] Production environment variables set

---

## 💡 **Pro Tips**

### **Cost Optimization**
- **WhatsApp**: Use text messages (₦8) instead of media (₦12) when possible
- **SMS**: Bulk messages are more cost-effective
- **Email**: Use for non-urgent communications (free)

### **Best Practices**
- **Phone Numbers**: Always use international format (+234...)
- **Message Content**: Keep WhatsApp messages under 1600 characters
- **Email**: Use HTML for better engagement
- **Monitoring**: Check balance regularly to avoid service interruption

### **Scaling**
- **High Volume**: Contact Termii for enterprise pricing
- **Multiple Senders**: Set up multiple sender IDs for different purposes
- **Automation**: Use webhooks for delivery status updates

---

**🎉 Your professional communication system is now ready!**

*No more QR codes, no more session management - just reliable, professional messaging with Naira payments!*