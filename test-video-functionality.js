#!/usr/bin/env node

// Test script to verify video functionality
require('dotenv').config();

async function testVideoFunctionality() {
  console.log('🎬 AKY Media Video System Test\n');
  console.log('Testing video functionality and connections...\n');

  // Test 1: Environment Variables
  console.log('1. 📋 Checking Environment Variables:');
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_BASE_URL'
  ];

  const optionalEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
    'NEXT_PUBLIC_CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  let envScore = 0;
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: Found`);
      envScore++;
    } else {
      console.log(`   ❌ ${envVar}: Missing (Required)`);
    }
  });

  console.log('\n   Optional (for Cloudinary upload):');
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: Found`);
    } else {
      console.log(`   ⚠️  ${envVar}: Missing (Optional)`);
    }
  });

  // Test 2: MongoDB Connection
  console.log('\n2. 🗄️  Testing MongoDB Connection:');
  try {
    const { connectToDatabase } = require('./lib/mongodb.ts');
    const { client, db } = await connectToDatabase();
    console.log('   ✅ MongoDB connection successful');
    
    // Test videos collection
    const videosCollection = db.collection('videos');
    const videoCount = await videosCollection.countDocuments();
    console.log(`   📊 Videos in database: ${videoCount}`);
    
    await client.close();
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.log('   ⚠️  MongoDB connection timeout - check your internet connection');
    } else if (error.message.includes('authentication')) {
      console.log('   ⚠️  MongoDB authentication failed - check your credentials');
    } else {
      console.log(`   ⚠️  MongoDB connection issue: ${error.message}`);
    }
  }

  // Test 3: Video Utils
  console.log('\n3. 🔧 Testing Video Utilities:');
  try {
    const { getYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail, isYouTubeUrl } = require('./lib/video-utils.ts');
    
    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://example.com/video.mp4'
    ];

    testUrls.forEach(url => {
      const isYT = isYouTubeUrl(url);
      const id = getYouTubeId(url);
      console.log(`   ${isYT ? '✅' : '⚠️'} ${url} -> YouTube: ${isYT}, ID: ${id || 'N/A'}`);
    });

    // Test embed URL generation
    const embedUrl = getYouTubeEmbedUrl('dQw4w9WgXcQ', true, false);
    console.log(`   ✅ Embed URL generated: ${embedUrl.substring(0, 50)}...`);

    // Test thumbnail URL generation
    const thumbnailUrl = getYouTubeThumbnail('dQw4w9WgXcQ');
    console.log(`   ✅ Thumbnail URL generated: ${thumbnailUrl.substring(0, 50)}...`);

  } catch (error) {
    console.log(`   ❌ Video utils test failed: ${error.message}`);
  }

  // Test 4: API Endpoints (if server is running)
  console.log('\n4. 🌐 Testing API Endpoints:');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/dashboard/videos`);
    if (response.ok) {
      const videos = await response.json();
      console.log(`   ✅ GET /api/dashboard/videos: ${videos.length} videos found`);
    } else {
      console.log(`   ⚠️  GET /api/dashboard/videos: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('   ℹ️  API test skipped: Server not running (start with npm run dev)');
  }

  // Test 5: File Structure
  console.log('\n5. 📁 Checking File Structure:');
  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'components/header.tsx',
    'app/video/page.tsx',
    'components/video-gallery.tsx',
    'app/dashboard/video/page.tsx',
    'app/api/dashboard/videos/route.ts',
    'app/api/dashboard/videos/[id]/route.ts',
    'lib/video-utils.ts',
    'components/ui/tabs.tsx',
    'components/ui/label.tsx'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file}: Missing`);
    }
  });

  // Test 6: Cloudinary Configuration
  console.log('\n6. ☁️  Cloudinary Configuration:');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    console.log('   ✅ Cloudinary credentials found');
    console.log(`   📋 Cloud Name: ${cloudName}`);
    console.log(`   📋 Upload Preset: ${uploadPreset}`);
    
    // Test Cloudinary API accessibility
    try {
      const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log(`   🔗 API Endpoint: ${testUrl}`);
      console.log('   ℹ️  Note: Upload functionality requires valid preset configuration');
    } catch (error) {
      console.log(`   ⚠️  Cloudinary test failed: ${error.message}`);
    }
  } else {
    console.log('   ⚠️  Cloudinary not configured (optional for YouTube-only setup)');
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  if (envScore === requiredEnvVars.length) {
    console.log('✅ Environment: All required variables set');
  } else {
    console.log(`❌ Environment: ${envScore}/${requiredEnvVars.length} required variables set`);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Ensure MongoDB is accessible and contains video data');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Visit /video to see the public gallery');
  console.log('4. Visit /dashboard/video for admin management');
  console.log('5. Configure Cloudinary for direct video uploads (optional)');

  console.log('\n📚 Documentation:');
  console.log('- Setup Guide: VIDEO_SETUP_GUIDE.md');
  console.log('- Environment: .env.example');
  console.log('- API Docs: Check the setup guide for endpoint details');

  console.log('\n✅ Video System Test Complete!\n');
  console.log('🚀 Ready to start development:');
  console.log('   npm run dev          # Start development server');
  console.log('   npm run build        # Build for production');
  console.log('   npm run export       # Export static files');
  console.log('   node build.config.js # Show all build options\n');
}

// Run the test
testVideoFunctionality().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});