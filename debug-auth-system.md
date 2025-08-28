# Youth Authentication System Debug Guide

## 🔍 **Debugging the Authentication Error**

The error "Authentication failed" in the youth dashboard can be caused by several issues. Here's a systematic approach to debug and fix it:

### 🔹 **1. Check Browser Console**

Open browser developer tools (F12) and check for:
- Network requests to `/api/youth/auth`
- Response status codes and error messages
- JavaScript errors in console
- localStorage token presence

### 🔹 **2. Verify Token Storage**

In browser console, check if token is stored:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('youthToken'))

// Check youth data
console.log('Youth Data:', localStorage.getItem('youthData'))

// Clear tokens if needed
localStorage.removeItem('youthToken')
localStorage.removeItem('youthData')
```

### 🔹 **3. Test Authentication API Directly**

Test the auth endpoint manually:

**Step 1: Login to get token**
```bash
curl -X POST http://localhost:3001/api/youth/auth \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueId": "KANO-DLA-2025-0001",
    "password": "YourPassword123"
  }'
```

**Step 2: Use token to verify**
```bash
curl -X GET http://localhost:3001/api/youth/auth \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 🔹 **4. Common Issues & Solutions**

#### **Issue 1: No Token in localStorage**
- **Cause**: User hasn't logged in or token was cleared
- **Solution**: Redirect to login page (already implemented)

#### **Issue 2: Invalid Token Format**
- **Cause**: Corrupted token or wrong JWT secret
- **Solution**: Clear localStorage and login again

#### **Issue 3: Token Expired**
- **Cause**: Token older than 7 days
- **Solution**: Login again to get new token

#### **Issue 4: Youth Not Found**
- **Cause**: Youth record deleted or ObjectId conversion issue
- **Solution**: Check database for youth record

#### **Issue 5: Youth Not Approved**
- **Cause**: Youth status is pending or rejected
- **Solution**: Admin needs to approve the youth

### 🔹 **5. Database Verification**

Check MongoDB for youth records:
```javascript
// In MongoDB shell or Compass
db.youth.find({}).limit(5)

// Check specific youth
db.youth.findOne({uniqueId: "KANO-DLA-2025-0001"})

// Check approval status
db.youth.find({approvalStatus: "approved"})
```

### 🔹 **6. Environment Variables**

Verify JWT_SECRET is set correctly:
```bash
# Check .env file
cat .env | grep JWT_SECRET

# Should show:
# JWT_SECRET=AKY_Youth_Program_2025_Super_Secret_JWT_Key_For_Authentication_System_v1.0
```

### 🔹 **7. Server Logs**

Check server console for:
- Authentication errors
- Database connection issues
- JWT verification errors
- ObjectId conversion errors

### 🔹 **8. Step-by-Step Testing**

1. **Register a new youth**:
   - Go to http://localhost:3001/register
   - Complete multi-step registration
   - Note the unique ID

2. **Approve the youth**:
   - Go to http://localhost:3001/dashboard/youth-management
   - Find the youth and click approve

3. **Login as youth**:
   - Go to http://localhost:3001/youth-login
   - Use unique ID and password
   - Check if token is stored

4. **Access dashboard**:
   - Go to http://localhost:3001/youth-dashboard
   - Should load without authentication error

### 🔹 **9. Quick Fixes**

#### **Fix 1: Clear All Tokens**
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
```

#### **Fix 2: Reset Youth Status**
```javascript
// In MongoDB
db.youth.updateMany(
  {approvalStatus: "pending"}, 
  {$set: {approvalStatus: "approved", status: "approved"}}
)
```

#### **Fix 3: Generate Test Token**
```javascript
// In Node.js console
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb')

const token = jwt.sign(
  { 
    youthId: "VALID_OBJECT_ID_HERE",
    uniqueId: "KANO-DLA-2025-0001",
    email: "test@example.com"
  },
  "AKY_Youth_Program_2025_Super_Secret_JWT_Key_For_Authentication_System_v1.0",
  { expiresIn: '7d' }
)

console.log('Test Token:', token)
```

### 🔹 **10. Expected Behavior**

✅ **Successful Flow**:
1. Youth registers → Gets unique ID
2. Admin approves → Status becomes "approved"
3. Youth logs in → Gets JWT token
4. Dashboard loads → Shows full content

❌ **Error Scenarios**:
- No token → Redirect to login
- Invalid token → Clear storage, redirect to login
- Expired token → Show error, redirect to login
- Youth not approved → Show pending/rejected message
- Youth not found → Show error, redirect to login

### 🔹 **11. Debug Commands**

Run these in browser console on youth dashboard:
```javascript
// Check current state
console.log('Mounted:', document.querySelector('[data-mounted]'))
console.log('Loading:', document.querySelector('[data-loading]'))
console.log('Token:', localStorage.getItem('youthToken'))

// Test auth manually
fetch('/api/youth/auth', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('youthToken')
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## 🎯 **Most Likely Solutions**

1. **Clear browser storage and login again**
2. **Ensure youth is approved in admin dashboard**
3. **Check server console for specific error messages**
4. **Verify JWT_SECRET environment variable**
5. **Test with a fresh registration and approval**

The authentication system should work correctly after following these debugging steps!