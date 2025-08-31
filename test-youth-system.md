# Youth Registration System Test Guide

## ✅ Complete System Testing

### 🔹 **1. Registration Flow Test**
1. **Navigate to Registration**: http://localhost:3001/register
2. **Complete Multi-Step Form**:
   - Step 1: Personal Information (Name, Email, Phone, DOB)
   - Step 2: Identification (NIN Number, Upload NIN Document)
   - Step 3: Location & Occupation (Select LGA, Occupation)
   - Step 4: Security (Create Password with validation)
   - Step 5: Review & Submit

3. **Expected Result**: 
   - Unique ID generated (format: KANO-XXX-2025-XXXX)
   - Redirect to success page with confirmation
   - Status: "Pending Approval"

### 🔹 **2. Admin Management Test**
1. **Access Admin Dashboard**: http://localhost:3001/dashboard
2. **Navigate to User Management**: Click "User Management" in sidebar
3. **View User List**: See all registered users with details
4. **Test Approve Function**:
   - Click green checkmark button for a pending user
   - Verify status changes to "Approved"
   - Check console for approval notification logs

5. **Test Reject Function**:
   - Click red X button for a pending user
   - Enter rejection reason
   - Verify status changes to "Rejected"
   - Check console for rejection notification logs

### 🔹 **3. Youth Login Test**
1. **Navigate to Youth Login**: http://localhost:3001/youth-login
2. **Login with Approved Youth**:
   - Enter Unique ID (from registration)
   - Enter Password (created during registration)
   - Click "Sign In"

3. **Expected Result**: 
   - Successful login
   - Redirect to youth dashboard
   - Access to all features (Programs, Music, Videos)

### 🔹 **4. Youth Dashboard Test**
1. **Verify Authentication**: Only approved youth can access full features
2. **Test Tabs**:
   - **Programs**: View available programs
   - **Music**: Browse and play music content
   - **Videos**: Watch educational and entertainment videos
   - **Profile**: View personal information
   - **Settings**: Manage notification preferences

3. **Test Logout**: Verify logout functionality works

### 🔹 **5. Security Test**
1. **Password Validation**: Test password strength requirements
2. **Account Locking**: Test 5 failed login attempts
3. **JWT Token**: Verify token expiration and refresh
4. **Approval Status**: Verify pending/rejected users have limited access

## 🔹 **Expected System Behavior**

### **Registration Process**:
- ✅ Multi-step form with validation
- ✅ Password hashing with bcryptjs
- ✅ File upload for NIN documents
- ✅ Unique ID generation per LGA
- ✅ Status: "Pending" by default

### **Admin Management**:
- ✅ View all user registrations
- ✅ Filter by status, LGA, search
- ✅ Approve/Reject with reasons
- ✅ Export data to CSV
- ✅ View detailed user profiles

### **Youth Authentication**:
- ✅ Login with Unique ID + Password
- ✅ JWT token-based sessions
- ✅ Account locking after failed attempts
- ✅ Approval-based access control

### **Youth Dashboard**:
- ✅ Full access for approved youth
- ✅ Limited access for pending/rejected
- ✅ Content sections (Programs, Music, Videos)
- ✅ Profile management
- ✅ Notification settings

## 🔹 **Notification System** (Console Logs)

When admin approves/rejects youth, check browser console for:
- ✅ Approval notifications with dashboard link
- ✅ Rejection notifications with reason
- ✅ Email/SMS/WhatsApp message content
- ✅ Youth login credentials

## 🔹 **Database Collections**

The system uses MongoDB with collection: `youth`

**Youth Document Structure**:
```json
{
  "_id": "ObjectId",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "Date",
  "age": "number",
  "ninNumber": "string",
  "password": "hashed_string",
  "ninDocument": {
    "url": "string",
    "public_id": "string",
    "filename": "string",
    "uploadedAt": "Date"
  },
  "lga": "string",
  "lgaCode": "string",
  "occupation": "string",
  "uniqueId": "KANO-XXX-2025-XXXX",
  "status": "pending|approved|rejected",
  "approvalStatus": "pending|approved|rejected",
  "approvedAt": "Date",
  "approvedBy": "string",
  "rejectedAt": "Date",
  "rejectedBy": "string",
  "rejectionReason": "string",
  "registeredAt": "Date",
  "emailVerified": "boolean",
  "phoneVerified": "boolean",
  "lastLogin": "Date",
  "loginAttempts": "number",
  "lockedUntil": "Date",
  "notifications": {
    "email": "boolean",
    "sms": "boolean",
    "whatsapp": "boolean"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 🔹 **Troubleshooting**

### **Common Issues**:
1. **bcryptjs Error**: Ensure `npm install bcryptjs @types/bcryptjs` is completed
2. **JWT Error**: Verify JWT_SECRET is set in .env file
3. **Database Error**: Check MongoDB connection string
4. **File Upload Error**: Verify Cloudinary configuration

### **Debug Steps**:
1. Check browser console for errors
2. Check server console for API logs
3. Verify database collections in MongoDB
4. Test API endpoints directly

## 🔹 **Success Criteria**

✅ **Registration**: Youth can complete multi-step registration
✅ **Admin Management**: Admin can approve/reject youth
✅ **Authentication**: Approved youth can login successfully
✅ **Dashboard**: Youth can access programs, music, videos
✅ **Security**: Password hashing, account locking works
✅ **Notifications**: Console logs show notification content

The system is fully functional when all these tests pass! 🎉