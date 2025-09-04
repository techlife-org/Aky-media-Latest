# AKY Media Deployment Guide

## Overview

This guide covers different deployment scenarios for the AKY Media website, including connection improvements and static export capabilities.

## 🔧 Connection Improvements

### Fixed Issues
- ✅ **Reduced retry noise**: Connection attempts now show user-friendly messages
- ✅ **Better error handling**: Network issues display helpful error messages instead of technical details
- ✅ **Improved MongoDB connection**: Faster connection with better timeout handling
- ✅ **Silent reconnection**: Database reconnections happen in the background

### Connection Messages
- **Before**: "Retrying connection... (3/3)" and "Attempt 3 of 3"
- **After**: "Reconnecting to stream..." and "Network connection issue detected"

## 🚀 Build & Deployment Options

### 1. Development Build
```bash
npm run dev
# or
node build.config.js development
```
**Features**: Hot reload, all API routes, database access, real-time features
**Use case**: Local development and testing

### 2. Production Build (Default)
```bash
npm run build
npm run start
# or
node build.config.js production
```
**Features**: Optimized build, all server features, API routes, database
**Use case**: Production deployment with server capabilities

### 3. Standalone Build
```bash
npm run build:standalone
npm run start:standalone
# or
node build.config.js standalone
```
**Features**: Self-contained server, includes Node.js runtime, all features
**Use case**: Docker deployment, VPS hosting, serverless containers

### 4. Static Export
```bash
npm run export
npm run preview
# or
node build.config.js static
```
**Features**: Static HTML/CSS/JS files, no server required, CDN ready
**Use case**: Static hosting (Netlify, Vercel static, GitHub Pages)
**Limitations**: No API routes, no database, no real-time features

## 📋 Build Configuration Helper

Use the build configuration script for guided builds:

```bash
# Show all available options
node build.config.js help

# Check environment setup
node build.config.js check

# Run specific build type
node build.config.js [development|production|standalone|static]
```

## 🌐 Deployment Scenarios

### Scenario 1: Full-Featured Deployment (Recommended)
**Best for**: Complete website with all features
**Requirements**: Node.js server, MongoDB access
**Commands**:
```bash
npm run build
npm run start
```
**Features**: ✅ All features enabled

### Scenario 2: Docker/Container Deployment
**Best for**: Containerized environments
**Requirements**: Docker, MongoDB access
**Commands**:
```bash
npm run build:standalone
# Copy .next/standalone/ to container
node server.js
```
**Features**: ✅ All features, self-contained

### Scenario 3: Static CDN Deployment
**Best for**: Fast loading, global distribution
**Requirements**: Static hosting service
**Commands**:
```bash
npm run export
# Deploy 'out' folder to CDN
```
**Features**: ⚠️ Limited (no server features)

### Scenario 4: Hybrid Deployment
**Best for**: Static pages with external API
**Setup**: Static export + separate API server
**Commands**:
```bash
# Frontend
npm run export

# API (separate deployment)
npm run build:standalone
```

## 🔧 Environment Configuration

### Required Variables
```env
# Database (required for full features)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Authentication (required for admin features)
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
```

### Optional Variables
```env
# Cloudinary (for video uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Communication (for SMS/WhatsApp)
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=AKY Media

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🐳 Docker Deployment

### Dockerfile Example
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY .next/standalone ./
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### Build Commands
```bash
# Build standalone version
npm run build:standalone

# Build Docker image
docker build -t aky-media .

# Run container
docker run -p 3000:3000 --env-file .env aky-media
```

## 📊 Performance Optimization

### Static Export Optimization
- ✅ Pre-rendered HTML pages
- ✅ Optimized images and assets
- ✅ CDN-ready structure
- ✅ Fast loading times

### Server Build Optimization
- ✅ Code splitting
- ✅ Image optimization
- ✅ API route optimization
- ✅ Database connection pooling

## 🔍 Testing Builds

### Test Video Functionality
```bash
npm run test-video
```

### Test Database Connection
```bash
npm run test-mongodb
```

### Test Full Workflow
```bash
npm run test-full-workflow
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Service temporarily unavailable"
**Cause**: Database connection issues
**Solution**: 
- Check MongoDB URI in .env
- Verify network connectivity
- Check database server status

#### 2. "Network connection timeout"
**Cause**: Slow or unstable internet connection
**Solution**:
- Check internet connection
- Try again in a few moments
- Contact your network administrator

#### 3. Static export missing features
**Cause**: API routes not available in static export
**Solution**:
- Use full production build instead
- Or implement client-side alternatives

#### 4. Build failures
**Cause**: Missing dependencies or configuration
**Solution**:
```bash
# Clean and reinstall
npm run clean:all

# Check environment
node build.config.js check

# Try build again
npm run build
```

## 📈 Monitoring & Maintenance

### Health Checks
- Database connectivity
- API endpoint availability
- Static asset loading
- Video streaming functionality

### Regular Tasks
1. Monitor database performance
2. Check video upload functionality
3. Verify email/SMS services
4. Update dependencies
5. Backup database regularly

## 🔐 Security Considerations

### Production Checklist
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] HTTPS enabled
- [ ] Admin credentials strong
- [ ] API rate limiting configured
- [ ] Error messages sanitized

### Static Export Security
- [ ] No sensitive data in client code
- [ ] External API endpoints secured
- [ ] CDN security headers configured
- [ ] Asset integrity verified

## 📞 Support

### Getting Help
1. Check this deployment guide
2. Review error logs
3. Test with build configuration script
4. Verify environment setup

### Useful Commands
```bash
# Quick environment check
node build.config.js check

# Test video system
npm run test-video

# Clean build
npm run clean && npm run build

# Full system test
npm run test-full-workflow
```

---

**Note**: Choose the deployment method that best fits your infrastructure and requirements. For full functionality, use the production or standalone builds. For maximum performance with limited features, use static export.