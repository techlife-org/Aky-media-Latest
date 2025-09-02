# Broadcast API Documentation

## 🎯 **Overview**

Complete API documentation for the Qodo Broadcast Management System with full start, pause, resume, stop, and management capabilities.

## ✅ **Fixed Issues**

- ✅ **Service Unavailable Errors**: All routes now use fallback database
- ✅ **Health Status**: Proper health monitoring implemented
- ✅ **Start/Stop/Pause/Resume**: Full broadcast lifecycle management
- ✅ **Authentication**: Consistent auth across all endpoints
- ✅ **Error Handling**: Graceful fallback and error responses

## 🔗 **API Endpoints**

### **Authentication Required**
All broadcast endpoints require authentication via `broadcast-auth-token` cookie.

### **1. Broadcast Status**
```
GET /api/broadcast/status
```

**Response (Inactive)**:
```json
{
  "isActive": false,
  "broadcast": null,
  "meetingId": null,
  "participants": 0,
  "startTime": null,
  "title": "",
  "viewerCount": 0,
  "meetingLink": null,
  "status": "idle",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  },
  "connectionQuality": "excellent"
}
```

**Response (Active)**:
```json
{
  "isActive": true,
  "broadcast": {
    "id": "abc123",
    "title": "Governor's Live Address",
    "description": "Live broadcast description",
    "startedAt": "2024-01-01T10:00:00Z",
    "participants": [...],
    "settings": {...}
  },
  "meetingId": "abc123",
  "participants": 5,
  "startTime": "2024-01-01T10:00:00Z",
  "title": "Governor's Live Address",
  "viewerCount": 25,
  "meetingLink": "http://localhost:4000/live?meeting=abc123",
  "status": "live",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  },
  "connectionQuality": "excellent",
  "uptime": 1800,
  "stats": {
    "totalViewTime": 45000,
    "peakViewers": 30,
    "averageViewTime": 1260,
    "chatMessages": 60
  }
}
```

### **2. Start Broadcast**
```
POST /api/broadcast/enhanced-start
```

**Request Body**:
```json
{
  "title": "Governor's Live Address",
  "description": "Important announcement from the Governor",
  "settings": {
    "maxParticipants": 1000,
    "allowScreenShare": true,
    "allowChat": true,
    "allowReactions": true,
    "requireApproval": false,
    "isPublic": true
  }
}
```

**Response**:
```json
{
  "message": "Broadcast started successfully",
  "broadcast": {
    "id": "abc123",
    "adminId": "admin123",
    "title": "Governor's Live Address",
    "description": "Important announcement from the Governor",
    "isActive": true,
    "isRecording": false,
    "startedAt": "2024-01-01T10:00:00Z",
    "meetingLink": "http://localhost:4000/live?meeting=abc123",
    "participants": [...],
    "settings": {...},
    "stats": {...}
  },
  "meetingLink": "http://localhost:4000/live?meeting=abc123",
  "meetingId": "abc123",
  "isExisting": false,
  "success": true,
  "timestamp": "2024-01-01T10:00:00Z",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  }
}
```

### **3. Stop Broadcast**
```
POST /api/broadcast/stop
```

**Request Body**:
```json
{
  "broadcastId": "abc123"  // Optional, stops all if not provided
}
```

**Response**:
```json
{
  "message": "Broadcast stopped successfully",
  "stoppedCount": 1,
  "success": true,
  "timestamp": "2024-01-01T11:00:00Z",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  }
}
```

### **4. Pause Broadcast**
```
POST /api/broadcast/pause
```

**Request Body**:
```json
{
  "broadcastId": "abc123"  // Optional
}
```

**Response**:
```json
{
  "message": "Broadcast paused successfully",
  "success": true,
  "broadcast": {
    "id": "abc123",
    "isPaused": true,
    "pausedAt": "2024-01-01T10:30:00Z",
    ...
  },
  "timestamp": "2024-01-01T10:30:00Z",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  }
}
```

### **5. Resume Broadcast**
```
POST /api/broadcast/resume
```

**Request Body**:
```json
{
  "broadcastId": "abc123"  // Optional
}
```

**Response**:
```json
{
  "message": "Broadcast resumed successfully",
  "success": true,
  "broadcast": {
    "id": "abc123",
    "isPaused": false,
    "resumedAt": "2024-01-01T10:35:00Z",
    ...
  },
  "timestamp": "2024-01-01T10:35:00Z",
  "health": {
    "server": true,
    "database": true,
    "streaming": true
  }
}
```

### **6. Manage Broadcast**
```
POST /api/broadcast/manage
```

**Actions Available**:
- `pause` - Pause the broadcast
- `resume` - Resume the broadcast
- `update_settings` - Update broadcast settings
- `update_title` - Update title and description
- `toggle_recording` - Start/stop recording
- `add_participant` - Add a participant
- `remove_participant` - Remove a participant

**Request Body Examples**:

**Update Title**:
```json
{
  "action": "update_title",
  "broadcastId": "abc123",
  "data": {
    "title": "Updated Broadcast Title",
    "description": "Updated description"
  }
}
```

**Update Settings**:
```json
{
  "action": "update_settings",
  "broadcastId": "abc123",
  "data": {
    "settings": {
      "maxParticipants": 500,
      "allowChat": false,
      "allowReactions": true
    }
  }
}
```

**Toggle Recording**:
```json
{
  "action": "toggle_recording",
  "broadcastId": "abc123"
}
```

**Add Participant**:
```json
{
  "action": "add_participant",
  "broadcastId": "abc123",
  "data": {
    "participant": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "viewer",
      "isApproved": true,
      "permissions": {
        "canSpeak": false,
        "canVideo": false,
        "canScreenShare": false,
        "canChat": true,
        "canReact": true
      }
    }
  }
}
```

**Remove Participant**:
```json
{
  "action": "remove_participant",
  "broadcastId": "abc123",
  "data": {
    "participantId": "user123"
  }
}
```

## 🔧 **Testing Commands**

```bash
# Test complete broadcast system
npm run test-broadcast-routes

# Test individual components
npm run test-fallback-auth
npm run test-broadcast-login
npm run test-broadcast-control

# Test database connectivity
npm run test-mongodb
npm run fix-mongodb
```

## 🏗️ **Broadcast Lifecycle**

1. **Initialize** → Login to admin panel
2. **Start** → Create new broadcast session
3. **Manage** → Pause/resume, update settings, manage participants
4. **Monitor** → Check status, view statistics
5. **Stop** → End broadcast session

## 📊 **Health Monitoring**

All endpoints return health status:
```json
{
  "health": {
    "server": true,     // API server status
    "database": true,   // Database connectivity
    "streaming": true   // Streaming service status
  }
}
```

## 🔒 **Authentication**

All broadcast endpoints require:
- Valid `broadcast-auth-token` cookie
- Admin must be authenticated and active
- JWT token verification

## 🛡️ **Error Handling**

### **Common Error Responses**:

**401 Unauthorized**:
```json
{
  "message": "Authentication required",
  "success": false
}
```

**503 Service Unavailable**:
```json
{
  "message": "Service temporarily unavailable. Please try again later.",
  "success": false,
  "health": {
    "server": false,
    "database": false,
    "streaming": false
  }
}
```

**404 Not Found**:
```json
{
  "message": "No active broadcast found",
  "success": false
}
```

**500 Internal Server Error**:
```json
{
  "message": "Internal server error",
  "success": false,
  "error": "Detailed error message (development only)",
  "health": {
    "server": false,
    "database": false,
    "streaming": false
  }
}
```

## 🔄 **Fallback System**

- **Primary**: MongoDB Atlas connection
- **Fallback**: In-memory database (development)
- **Automatic**: Seamless switching when Atlas unavailable
- **Persistent**: Data maintained across requests during session

## 🎯 **Usage Examples**

### **Complete Broadcast Session**:
```javascript
// 1. Start broadcast
const startResponse = await fetch('/api/broadcast/enhanced-start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Governor's Address",
    settings: { maxParticipants: 1000 }
  })
})

// 2. Check status
const statusResponse = await fetch('/api/broadcast/status')

// 3. Pause if needed
await fetch('/api/broadcast/pause', {
  method: 'POST',
  body: JSON.stringify({ broadcastId: 'abc123' })
})

// 4. Resume
await fetch('/api/broadcast/resume', {
  method: 'POST',
  body: JSON.stringify({ broadcastId: 'abc123' })
})

// 5. Stop when done
await fetch('/api/broadcast/stop', {
  method: 'POST',
  body: JSON.stringify({ broadcastId: 'abc123' })
})
```

---

**🎉 All broadcast routes are now fully functional with fallback database support!**