# Qodo Broadcast System - Quick Setup Guide

## 🚀 Quick Start

### 1. Initialize Broadcast Admin

Run this command to create the default broadcast administrator:

```bash
npm run init-broadcast-admin
```

This creates:
- **Email**: `admin@akymediacenter.com`
- **Password**: `BroadcastAdmin2024!`
- **Login URL**: `/broadcast-admin/login`

### 2. Access the System

#### For Broadcast Administrators:
1. Go to `/broadcast-admin/login`
2. Login with the credentials above
3. You'll be redirected to `/broadcast-control` (Live Broadcast Control Page)
4. Initialize your camera and microphone
5. Start broadcasting!

#### For Participants/Viewers:
1. Admin shares the broadcast link (generated when broadcast starts)
2. Participants click the link
3. Enter their name to join
4. Enjoy the interactive broadcast experience!

### 3. Key URLs

- **Admin Login**: `/broadcast-admin/login`
- **🎥 Live Broadcast Control**: `/broadcast-control` (NEW - Main broadcast page)
- **Enhanced Dashboard**: `/dashboard/broadcast/enhanced`
- **Enhanced Live Page**: `/live/enhanced`
- **Original Live Page**: `/live` (still works)
- **Original Dashboard**: `/dashboard/broadcast` (still works)

### 4. Features Overview

#### 🎥 Live Broadcast Control Page Features:
- ✅ **Real-time camera and microphone access**
- ✅ **Live video preview with proper media controls**
- ✅ **Screen sharing functionality**
- ✅ **Broadcast start/stop controls**
- ✅ **Real-time participant management**
- ✅ **Live statistics and analytics**
- ✅ **System health monitoring**
- ✅ **Shareable broadcast links**

#### Participant Features:
- ✅ Join via unique links
- ✅ Watch live video/audio
- ✅ Interactive chat
- ✅ Emoji reactions
- ✅ Real-time participant list
- ✅ Mobile-responsive interface

### 5. How to Use the Live Broadcast Control

#### Step 1: Login
- Navigate to `/broadcast-admin/login`
- Enter your credentials
- You'll be automatically redirected to `/broadcast-control`

#### Step 2: Initialize Media
- Click "Initialize Media" button
- Allow camera and microphone permissions
- Your live preview will appear

#### Step 3: Configure Broadcast
- Set broadcast title and description
- Configure settings (chat, reactions, screen share)
- Ensure your camera and microphone are working

#### Step 4: Start Broadcasting
- Click "Start Broadcast"
- Copy the generated meeting link
- Share with participants

#### Step 5: Manage Live Broadcast
- Use media controls (camera on/off, mic on/off, screen share)
- Monitor participants in real-time
- View live statistics
- Stop broadcast when finished

### 6. Media Controls

#### Camera Controls:
- **Camera On/Off**: Toggle video feed
- **Microphone On/Off**: Toggle audio feed
- **Screen Share**: Share your screen instead of camera

#### Broadcast Controls:
- **Start Broadcast**: Begin live streaming
- **Stop Broadcast**: End live streaming
- **Copy Link**: Share broadcast URL with participants

### 7. Troubleshooting

#### Camera/Microphone Issues:
1. **Permission Denied**: Allow camera/microphone access in browser
2. **Device Not Found**: Ensure camera/microphone are connected
3. **Already in Use**: Close other applications using camera/microphone
4. **Poor Quality**: Check internet connection and device settings

#### Common Solutions:
- Refresh the page and try again
- Check browser permissions for camera/microphone
- Ensure you're using HTTPS in production
- Test with different browsers (Chrome recommended)

### 8. Security Notes

⚠️ **IMPORTANT**: 
- Change the default admin password after first login
- Set strong JWT_SECRET in production
- Configure proper CORS origins
- Enable HTTPS in production
- Only share broadcast links with intended participants

### 9. Environment Variables Required

```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=your-mongodb-connection-string
NEXT_PUBLIC_BASE_URL=https://your-domain.com
BROADCAST_ADMIN_EMAIL=admin@akymediacenter.com
BROADCAST_ADMIN_PASSWORD=BroadcastAdmin2024!
BROADCAST_ADMIN_NAME=Broadcast Administrator
```

### 10. Testing Commands

```bash
# Test login credentials
npm run test-broadcast-login

# Initialize broadcast admin
npm run init-broadcast-admin

# Complete setup
npm run setup-broadcast
```

---

## 🎯 New Live Broadcast Control Page

The main improvement is the dedicated `/broadcast-control` page that provides:

### ✅ **Working Camera & Audio**
- Proper media device access
- Real-time video preview
- Audio/video toggle controls
- Screen sharing capability

### ✅ **Professional Interface**
- Clean, focused broadcast control interface
- Real-time statistics
- Participant management
- System health monitoring

### ✅ **Seamless Workflow**
1. Login → Automatic redirect to broadcast control
2. Initialize media → Camera/microphone access
3. Configure broadcast → Set title, description, settings
4. Start broadcast → Generate shareable link
5. Manage live → Control media, monitor participants
6. Stop broadcast → End session

**🎉 The system is now ready for professional live broadcasting! 🎉**

For detailed documentation, see `QODO_BROADCAST_SYSTEM.md`