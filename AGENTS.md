# AKY Media Center - Project Overview for AI Agents

## Project Summary
The AKY Media Center is the official website and media platform for Governor Abba Kabir Yusuf of Kano State, Nigeria. This is a comprehensive Next.js 14 application featuring video management, news publishing, communication systems, and administrative dashboards.

## Technology Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: MongoDB with connection pooling
- **Media Storage**: Cloudinary for video/image uploads
- **Authentication**: JWT-based authentication system
- **Communication**: Termii (SMS/WhatsApp), Nodemailer (Email)
- **Real-time**: Socket.io for live features
- **Deployment**: Vercel-ready with standalone build options

## Key Features
1. **Video Management System**: YouTube integration + direct uploads with mobile YouTube Shorts-style interface
2. **News & Content Management**: Dynamic articles, achievements, newsletters
3. **Communication Systems**: SMS, WhatsApp, Email integration via Termii and SMTP
4. **Admin Dashboard**: Comprehensive management interface
5. **Live Broadcast System**: Real-time streaming capabilities
6. **Youth Management**: Special youth programs and applications
7. **Audio Content**: Music and audio streaming

## Project Structure
```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── dashboard/         # Admin dashboard pages
│   ├── video/            # Video gallery and management
│   ├── news/             # News articles and management
│   ├── achievements/     # Government achievements showcase
│   ├── live/             # Live broadcast interface
│   └── youth-*/          # Youth program pages
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix-based)
│   ├── header.tsx        # Main navigation
│   ├── video-gallery.tsx # Video display component
│   └── ...
├── lib/                  # Utility functions and configurations
│   ├── mongodb.ts        # Database connection
│   ├── schemas/          # Zod validation schemas
│   ├── security/         # Authentication utilities
│   └── ...
├── models/               # MongoDB data models
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── scripts/              # Build and utility scripts
```

## Key API Endpoints
- `/api/dashboard/videos` - Video CRUD operations
- `/api/dashboard/news` - News management
- `/api/dashboard/achievements` - Achievement management
- `/api/broadcast/*` - Live broadcast control
- `/api/communication/*` - SMS/Email/WhatsApp services
- `/api/youth/*` - Youth program management
- `/api/admin/*` - Administrative functions

## Environment Configuration
The project requires several environment variables:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication secret
- `NEXT_PUBLIC_CLOUDINARY_*` - Media upload configuration
- `TERMII_*` - SMS/WhatsApp API credentials
- `SMTP_*` - Email configuration
- Various admin credentials and API keys

## Development Commands
- `npm run dev` - Development server (port 4000)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run test-*` - Various testing scripts
- `npm run init-*` - Initialization scripts

## Key Components to Understand
1. **Video System**: Dual upload (YouTube + Cloudinary) with mobile-first design
2. **Authentication**: JWT-based with admin/user roles
3. **Communication**: Multi-channel messaging system
4. **Database**: MongoDB with proper connection handling
5. **Real-time Features**: Socket.io for live broadcasts
6. **Mobile Experience**: YouTube Shorts-style video interface

## Common Tasks
- Adding new video content and management
- Managing news articles and achievements
- Configuring communication templates
- Setting up broadcast systems
- Youth program administration
- Database connection troubleshooting
- Mobile responsiveness optimization

## Security Considerations
- JWT authentication for admin areas
- Input validation with Zod schemas
- File upload restrictions and validation
- Environment variable protection
- Rate limiting on sensitive endpoints

## Deployment Notes
- Vercel-optimized with standalone build option
- MongoDB Atlas for production database
- Cloudinary for media CDN
- Environment variables configured in deployment platform

## Documentation Files
The project includes extensive documentation:
- `README.md` - Main project documentation
- `VIDEO_SETUP_GUIDE.md` - Video system setup
- `BROADCAST_*.md` - Broadcast system documentation
- `COMMUNICATION_*.md` - Communication setup guides
- Various troubleshooting and setup guides

## Special Features
- **Nigerian Focus**: Termii integration for local SMS/WhatsApp
- **Government Portal**: Official state government platform
- **Multi-media**: Video, audio, news, achievements
- **Youth Programs**: Special youth engagement features
- **Live Broadcasting**: Real-time streaming capabilities
- **Mobile-First**: YouTube Shorts-style mobile experience

This project serves as the digital presence for Kano State Government, focusing on transparency, public engagement, and multimedia content delivery.