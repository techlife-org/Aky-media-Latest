#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building static export...');

// Temporarily move API directory to exclude it from export
const apiDir = path.join(process.cwd(), 'app/api');
const apiBackupDir = path.join(process.cwd(), 'api-backup');

try {
  // Backup API directory
  if (fs.existsSync(apiDir)) {
    console.log('📁 Backing up API routes...');
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, apiBackupDir);
  }

  // Run the export build
  console.log('🔨 Running static export build...');
  execSync('EXPORT_STATIC=true next build', { 
    stdio: 'inherit',
    env: { ...process.env, EXPORT_STATIC: 'true' }
  });

  console.log('✅ Static export completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore API directory
  if (fs.existsSync(apiBackupDir)) {
    console.log('🔄 Restoring API routes...');
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.renameSync(apiBackupDir, apiDir);
  }
}

console.log('🎉 Build process completed!');