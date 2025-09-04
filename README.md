# AKY Media Center - Governor Abba Kabir Yusuf Official Website

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/techlifenigeria-6265s-projects/v0-next-js-home-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-blue?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)

## 🎯 Overview

The official website and media center for Governor Abba Kabir Yusuf of Kano State, Nigeria. This comprehensive platform showcases government achievements, news, and multimedia content with a focus on transparency and public engagement.

## ✨ Key Features

### 🎬 **Video Management System**
- **YouTube Integration**: Seamless embedding of YouTube videos with automatic thumbnail generation
- **Direct Upload**: Cloudinary-powered video uploads with optimization and CDN delivery
- **Mobile Experience**: YouTube Shorts-style vertical scrolling on mobile devices
- **Responsive Design**: Beautiful grid layout for desktop viewing
- **Admin Dashboard**: Professional video management interface
- **Categories**: Organized content by Education, Infrastructure, Healthcare, etc.
- **Featured Content**: Highlight important videos and announcements

### 📰 **News & Content Management**
- Dynamic news articles with rich media support
- Achievement showcases with detailed information
- Newsletter subscription system
- Search functionality across all content

### 🎵 **Audio Content**
- Music and audio content management
- Streaming capabilities
- Organized audio library

### 📱 **Communication Systems**
- SMS integration via Termii (Nigeria-focused)
- WhatsApp messaging capabilities
- Email notifications and newsletters
- Multi-channel communication support

### 🔐 **Admin Features**
- Secure dashboard for content management
- User authentication and authorization
- Analytics and reporting
- Broadcast control system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Cloudinary account (optional, for video uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/aky-media-latest.git
   cd aky-media-latest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   
   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   
   # Cloudinary (for video uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test Video Functionality**
   ```bash
   node test-video-functionality.js
   ```

## 📖 Documentation

### Video System
- **Setup Guide**: [VIDEO_SETUP_GUIDE.md](./VIDEO_SETUP_GUIDE.md)
- **API Documentation**: Detailed in the setup guide
- **Mobile Experience**: YouTube Shorts-style implementation
- **Admin Interface**: Professional dashboard at `/dashboard/video`

### API Endpoints

#### Video Management
- `GET /api/dashboard/videos` - Fetch all videos
- `POST /api/dashboard/videos` - Create new video
- `PUT /api/dashboard/videos/[id]` - Update video
- `DELETE /api/dashboard/videos/[id]` - Delete video

#### Broadcast System
- `GET /api/broadcast/status` - Get broadcast status
- `POST /api/broadcast/start` - Start broadcast
- `POST /api/broadcast/stop` - Stop broadcast
- `POST /api/broadcast/join` - Join broadcast
- `POST /api/broadcast/heartbeat` - Maintain broadcast

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **State Management**: React hooks and context
- **Responsive Design**: Mobile-first approach

### Backend
- **API**: Next.js API routes
- **Database**: MongoDB with connection pooling
- **File Storage**: Cloudinary for media assets
- **Authentication**: JWT-based auth system

### Video System
- **YouTube Integration**: Automatic ID extraction and embedding
- **Direct Upload**: Cloudinary video processing
- **Mobile Player**: Custom YouTube Shorts-style interface
- **Desktop Player**: Modal-based video viewing

## 🎨 Design System

### Color Scheme
- **Primary**: Red gradient theme (`from-red-600 to-red-700`)
- **Secondary**: Blue, purple, and green accents
- **Background**: Gradient overlays and backdrop blur effects
- **Typography**: Modern font weights with gradient text effects

### Components
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean inputs with focus states
- **Modals**: Full-screen video players with controls

## 📱 Mobile Experience

### Video Gallery
- **Vertical Scrolling**: YouTube Shorts-style navigation
- **Auto-play**: Videos play automatically on scroll
- **Touch Controls**: Tap to play/pause, mute/unmute
- **Overlay Information**: Title, description, and stats
- **Smooth Transitions**: Intersection Observer for performance

### Responsive Design
- **Breakpoints**: Mobile-first with tablet and desktop variants
- **Navigation**: Collapsible mobile menu
- **Typography**: Scalable text sizes
- **Images**: Optimized loading with Next.js Image

## 🔧 Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard
│   ├── video/            # Video gallery page
│   └── ...
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── header.tsx        # Navigation header
│   ├── video-gallery.tsx # Video display component
│   └── ...
├── lib/                  # Utility functions
│   ├── mongodb.ts        # Database connection
│   ├── video-utils.ts    # Video processing utilities
│   └── ...
└── public/               # Static assets
```

### Key Components

#### Video Gallery (`components/video-gallery.tsx`)
- Mobile YouTube Shorts-style player
- Desktop grid layout with modal player
- "Coming Soon" state for empty galleries
- Intersection Observer for auto-play

#### Dashboard (`app/dashboard/video/page.tsx`)
- Professional admin interface
- Dual upload methods (YouTube + Cloudinary)
- Video management with CRUD operations
- Statistics and analytics display

#### Header (`components/header.tsx`)
- Responsive navigation with video link
- Red color theme implementation
- Mobile-optimized menu system
- Search functionality integration

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🧪 Testing

### Video Functionality Test
```bash
node test-video-functionality.js
```

This script tests:
- Environment variable configuration
- MongoDB connection
- Video utility functions
- API endpoint accessibility
- File structure integrity
- Cloudinary configuration

### Manual Testing Checklist
- [ ] Video upload (both YouTube and Cloudinary)
- [ ] Mobile video playback (YouTube Shorts style)
- [ ] Desktop video modal
- [ ] Admin dashboard functionality
- [ ] Responsive design across devices
- [ ] "Coming Soon" state display

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
JWT_SECRET=your_production_jwt_secret
```

## 🔒 Security

### Video Upload Security
- File type validation (video/* only)
- File size limits (100MB maximum)
- Unsigned Cloudinary upload presets
- Server-side validation and sanitization

### Database Security
- MongoDB connection with authentication
- Input sanitization for all user data
- Proper error handling without data exposure
- Admin authentication for management features

### API Security
- JWT-based authentication
- Rate limiting on sensitive endpoints
- CORS configuration
- Environment variable protection

## 🌍 Communication Features

### SMS Integration (Termii)
- Nigeria-focused SMS provider
- Competitive local rates (₦10-20 per SMS)
- High delivery rates
- Unified API for SMS and WhatsApp

### Email System
- SMTP configuration for multiple providers
- Newsletter subscription management
- Automated notifications
- Professional email templates

### WhatsApp Integration
- Business messaging capabilities
- Automated responses
- Broadcast messaging
- Integration with Termii API

## 📊 Analytics & Monitoring

### Video Analytics
- View count tracking
- Duration statistics
- Category performance
- Featured content metrics

### System Health
- Database connection monitoring
- API response time tracking
- Error logging and reporting
- Performance metrics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📞 Support

### Documentation
- [Video Setup Guide](./VIDEO_SETUP_GUIDE.md)
- [Environment Configuration](./.env.example)
- API documentation in setup guide

### Common Issues
- MongoDB connection problems
- Cloudinary upload failures
- Video playback issues
- Mobile responsiveness

### Getting Help
1. Check documentation first
2. Review error logs
3. Verify environment configuration
4. Test with sample data

## 🔮 Future Enhancements

### Planned Features
- [ ] Video analytics dashboard
- [ ] Playlist functionality
- [ ] Live streaming integration
- [ ] Video comments system
- [ ] Advanced search filters
- [ ] Social media sharing
- [ ] Video transcoding options
- [ ] SEO optimization

### Technical Improvements
- [ ] Performance optimization
- [ ] Caching strategies
- [ ] CDN integration
- [ ] Progressive web app features
- [ ] Offline functionality

## 📄 License

This project is proprietary software for the Government of Kano State, Nigeria.

## 🏛️ About

**Governor Abba Kabir Yusuf** serves as the Executive Governor of Kano State, Nigeria. This platform serves as the official digital presence for government communications, achievements, and public engagement.

**Kano State** is one of Nigeria's most populous states, known for its rich history, commercial activities, and agricultural significance.

---

**Built with ❤️ for the people of Kano State**

For technical support or inquiries, please contact the development team.