# Video Management System Setup Guide

## Overview
The AKY Media video management system supports both YouTube integration and direct video uploads via Cloudinary. This guide will help you set up and configure the video functionality.

## Features
- ✅ YouTube video integration with automatic thumbnail generation
- ✅ Direct video upload to Cloudinary
- ✅ Mobile-optimized YouTube Shorts-style viewing
- ✅ Responsive desktop grid layout
- ✅ Video categorization and featured content
- ✅ "Coming Soon" placeholder when no videos exist
- ✅ Professional dashboard for video management

## Prerequisites

### 1. MongoDB Database
Ensure your MongoDB connection is working:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 2. Cloudinary Account (Optional but Recommended)
For direct video uploads, you'll need a Cloudinary account:

1. **Sign up**: Visit [cloudinary.com](https://cloudinary.com) and create a free account
2. **Get credentials**: From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. **Create upload preset**: 
   - Go to Settings > Upload
   - Create an unsigned upload preset
   - Set resource type to "Video"
   - Configure any transformations you need

### 3. Environment Variables
Add these to your `.env` file:

```env
# Cloudinary Configuration (for video uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Database Schema

The video system uses a `videos` collection with the following structure:

```javascript
{
  _id: ObjectId,
  title: String,           // Video title
  description: String,     // Video description
  videoUrl: String,        // YouTube URL or Cloudinary URL
  thumbnail: String,       // Thumbnail URL (auto-generated for YouTube)
  category: String,        // Video category
  featured: Boolean,       // Whether video is featured
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## Usage Guide

### For Administrators

#### 1. Accessing Video Management
- Navigate to `/dashboard/video` (requires admin authentication)
- View comprehensive statistics and video overview

#### 2. Adding Videos

**Method 1: YouTube Integration**
1. Click "Add New Video"
2. Select "YouTube Link" tab
3. Paste any YouTube URL (supports all formats)
4. Fill in title, description, and category
5. Thumbnail will be auto-generated
6. Click "Add Video"

**Method 2: Direct Upload**
1. Click "Add New Video"
2. Select "Upload Video" tab
3. Click to select video file (MP4, MOV, AVI up to 100MB)
4. Wait for upload to complete
5. Fill in title, description, and category
6. Click "Add Video"

#### 3. Managing Videos
- **Edit**: Click the "Edit" button on any video card
- **Delete**: Use the dropdown menu to delete videos
- **Feature**: Mark videos as featured for prominent display
- **Search**: Use the search bar to find specific videos
- **Filter**: Filter by category using the dropdown

### For Visitors

#### 1. Viewing Videos
- Visit `/video` to see the video gallery
- On mobile: Enjoy YouTube Shorts-style vertical scrolling
- On desktop: Browse the responsive grid layout

#### 2. Video Playback
- Click any video to open the modal player
- Videos auto-play with full controls
- YouTube videos use embedded player
- Direct uploads use HTML5 video player

## Technical Implementation

### API Endpoints

#### GET `/api/dashboard/videos`
Fetch all videos with metadata
```javascript
// Response
[
  {
    id: "string",
    title: "string",
    description: "string",
    videoUrl: "string",
    thumbnail: "string",
    category: "string",
    featured: boolean,
    createdAt: "ISO string",
    updatedAt: "ISO string"
  }
]
```

#### POST `/api/dashboard/videos`
Create a new video
```javascript
// Request body
{
  title: "string",
  description: "string",
  videoUrl: "string",
  thumbnail: "string", // optional
  category: "string",
  featured: boolean
}
```

#### PUT `/api/dashboard/videos/[id]`
Update an existing video
```javascript
// Request body (same as POST)
{
  title: "string",
  description: "string",
  videoUrl: "string",
  thumbnail: "string",
  category: "string",
  featured: boolean
}
```

#### DELETE `/api/dashboard/videos/[id]`
Delete a video by ID

### Video Processing

#### YouTube Integration
- Automatic video ID extraction from any YouTube URL format
- Thumbnail generation using YouTube's API
- Embedded player with optimized settings
- Support for all YouTube video types

#### Cloudinary Integration
- Direct video upload with progress tracking
- Automatic optimization and compression
- Thumbnail generation
- CDN delivery for fast loading

### Mobile Experience
- YouTube Shorts-style vertical scrolling
- Touch controls for play/pause and mute
- Auto-play on scroll with intersection observer
- Optimized for mobile viewing

## Troubleshooting

### Common Issues

#### 1. "Service temporarily unavailable"
- Check MongoDB connection string
- Verify database is accessible
- Check network connectivity

#### 2. Cloudinary upload fails
- Verify environment variables are set correctly
- Check upload preset exists and is unsigned
- Ensure file size is under 100MB
- Verify file type is supported (video/*)

#### 3. YouTube videos not loading
- Check if URL is valid YouTube link
- Verify video is public and embeddable
- Check network connectivity

#### 4. Videos not displaying
- Check if videos collection exists in MongoDB
- Verify video documents have required fields
- Check browser console for JavaScript errors

### Performance Optimization

#### 1. Video Loading
- YouTube videos use lazy loading
- Thumbnails are optimized for fast loading
- Mobile videos use intersection observer for performance

#### 2. Database Queries
- Videos are sorted by creation date (newest first)
- Pagination can be added for large collections
- Indexes recommended on `createdAt` and `category` fields

#### 3. Cloudinary Optimization
- Videos are automatically optimized on upload
- Thumbnails are generated at multiple sizes
- CDN ensures fast global delivery

## Security Considerations

### 1. File Upload Security
- File type validation (video/* only)
- File size limits (100MB max)
- Unsigned upload presets for security
- Server-side validation

### 2. Database Security
- Input sanitization for all fields
- MongoDB injection prevention
- Proper error handling without data exposure

### 3. Access Control
- Admin authentication required for management
- Public read access for video viewing
- Secure API endpoints

## Maintenance

### Regular Tasks
1. **Monitor Storage**: Check Cloudinary usage and storage limits
2. **Database Cleanup**: Remove orphaned or unused video records
3. **Performance**: Monitor video loading times and optimize as needed
4. **Backups**: Regular backup of video metadata and configurations

### Updates
- Keep dependencies updated for security
- Monitor Cloudinary and YouTube API changes
- Test video functionality after updates

## Support

For technical support or questions:
1. Check this documentation first
2. Review error logs in browser console
3. Verify environment configuration
4. Test with sample videos

## Future Enhancements

Potential improvements for the video system:
- Video analytics and view tracking
- Playlist functionality
- Video comments and ratings
- Advanced search and filtering
- Video transcoding options
- Live streaming integration
- Video SEO optimization
- Social media sharing