#!/usr/bin/env node

/**
 * Build Configuration Script for AKY Media
 * 
 * This script helps manage different build scenarios:
 * 1. Development build (with all features)
 * 2. Production build (standalone server)
 * 3. Static export (for CDN deployment)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build configurations
const BUILD_CONFIGS = {
  development: {
    command: 'npm run dev',
    description: 'Start development server with hot reload',
    port: 4000,
    features: ['API routes', 'Database', 'Real-time features', 'Hot reload']
  },
  
  production: {
    command: 'npm run build && npm run start',
    description: 'Build and start production server',
    port: 4000,
    features: ['API routes', 'Database', 'Real-time features', 'Optimized build']
  },
  
  standalone: {
    command: 'npm run build:standalone',
    description: 'Build standalone server (includes Node.js runtime)',
    output: '.next/standalone/',
    features: ['API routes', 'Database', 'Real-time features', 'Self-contained']
  },
  
  static: {
    command: 'npm run export',
    description: 'Export static files (no server-side features)',
    output: 'out/',
    features: ['Static pages', 'Client-side only', 'CDN ready'],
    limitations: ['No API routes', 'No database', 'No real-time features']
  }
};

function showHelp() {
  console.log('🏗️  AKY Media Build Configuration\n');
  console.log('Available build types:\n');
  
  Object.entries(BUILD_CONFIGS).forEach(([type, config]) => {
    console.log(`📦 ${type.toUpperCase()}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Command: ${config.command}`);
    if (config.port) console.log(`   Port: ${config.port}`);
    if (config.output) console.log(`   Output: ${config.output}`);
    console.log(`   Features: ${config.features.join(', ')}`);
    if (config.limitations) console.log(`   Limitations: ${config.limitations.join(', ')}`);
    console.log('');
  });
  
  console.log('Usage examples:');
  console.log('  node build.config.js development  # Start dev server');
  console.log('  node build.config.js production   # Build and start production');
  console.log('  node build.config.js standalone   # Build standalone server');
  console.log('  node build.config.js static       # Export static files');
  console.log('');
}

function checkEnvironment() {
  console.log('🔍 Checking environment...\n');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js: ${nodeVersion}`);
  
  // Check if .env exists
  const envExists = fs.existsSync('.env');
  console.log(`Environment file: ${envExists ? '✅ Found' : '❌ Missing (.env)'}`);
  
  // Check MongoDB URI
  require('dotenv').config();
  const mongoUri = process.env.MONGODB_URI;
  console.log(`MongoDB URI: ${mongoUri ? '✅ Configured' : '❌ Missing'}`);
  
  // Check Cloudinary config
  const cloudinaryName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  console.log(`Cloudinary: ${cloudinaryName ? '✅ Configured' : '⚠️  Optional (for video uploads)'}`);
  
  console.log('');
}

function runBuild(buildType) {
  const config = BUILD_CONFIGS[buildType];
  
  if (!config) {
    console.error(`❌ Unknown build type: ${buildType}`);
    console.log('Available types:', Object.keys(BUILD_CONFIGS).join(', '));
    process.exit(1);
  }
  
  console.log(`🚀 Starting ${buildType.toUpperCase()} build...\n`);
  console.log(`Description: ${config.description}`);
  console.log(`Features: ${config.features.join(', ')}`);
  if (config.limitations) {
    console.log(`Limitations: ${config.limitations.join(', ')}`);
  }
  console.log('');
  
  try {
    // Set environment variables based on build type
    const env = { ...process.env };
    
    if (buildType === 'standalone') {
      env.BUILD_STANDALONE = 'true';
    } else if (buildType === 'static') {
      env.EXPORT_STATIC = 'true';
    }
    
    // Clean previous builds
    if (buildType !== 'development') {
      console.log('🧹 Cleaning previous builds...');
      try {
        execSync('npm run clean', { stdio: 'inherit', env });
      } catch (error) {
        console.warn('⚠️  Clean command failed, continuing...');
      }
    }
    
    // Run the build command
    console.log(`📦 Running: ${config.command}`);
    execSync(config.command, { stdio: 'inherit', env });
    
    // Show success message
    console.log(`\n✅ ${buildType.toUpperCase()} build completed successfully!`);
    
    if (config.output) {
      console.log(`📁 Output directory: ${config.output}`);
    }
    
    if (buildType === 'standalone') {
      console.log('\n🚀 To start the standalone server:');
      console.log('   npm run start:standalone');
    } else if (buildType === 'static') {
      console.log('\n🌐 To preview the static export:');
      console.log('   npm run preview');
      console.log('   # or serve the "out" directory with any static server');
    }
    
  } catch (error) {
    console.error(`\n❌ ${buildType.toUpperCase()} build failed:`, error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  if (command === 'check' || command === 'env') {
    checkEnvironment();
    return;
  }
  
  // Check environment before building
  checkEnvironment();
  
  // Run the specified build
  runBuild(command);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { BUILD_CONFIGS, runBuild, checkEnvironment };