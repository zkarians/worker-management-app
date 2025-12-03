/**
 * Mobile Build Script
 * Temporarily moves API routes, builds static app, then restores them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const apiBackupDir = path.join(__dirname, '..', '.temp-api-backup');
const nextDir = path.join(__dirname, '..', '.next');
const outDir = path.join(__dirname, '..', 'out');

console.log('📱 Starting mobile app build...\n');

try {
    // Step 1: Clean previous builds
    console.log('1️⃣ Cleaning previous builds...');
    if (fs.existsSync(nextDir)) {
        fs.rmSync(nextDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
    }
    console.log('✅ Previous builds cleaned\n');

    // Step 2: Backup API routes (outside app directory)
    console.log('2️⃣ Backing up API routes...');
    if (fs.existsSync(apiDir)) {
        if (fs.existsSync(apiBackupDir)) {
            fs.rmSync(apiBackupDir, { recursive: true, force: true });
        }
        fs.renameSync(apiDir, apiBackupDir);
        console.log('✅ API routes backed up to .temp-api-backup\n');
    }

    // Step 3: Build Next.js app
    console.log('3️⃣ Building Next.js static app...');
    execSync('next build', { stdio: 'inherit' });
    console.log('✅ Next.js build complete\n');

    // Step 4: Restore API routes
    console.log('4️⃣ Restoring API routes...');
    if (fs.existsSync(apiBackupDir)) {
        if (fs.existsSync(apiDir)) {
            fs.rmSync(apiDir, { recursive: true, force: true });
        }
        fs.renameSync(apiBackupDir, apiDir);
        console.log('✅ API routes restored\n');
    }

    console.log('🎉 Mobile build completed successfully!\n');
    console.log('📦 Build output: ./out\n');
    console.log('Next steps:');
    console.log('  - Run: npm run cap:sync');
    console.log('  - Or run: npm run cap:open:android');

} catch (error) {
    // Always restore API routes on error
    console.error('\n❌ Build failed:', error.message);

    if (fs.existsSync(apiBackupDir)) {
        console.log('\n🔄 Restoring API routes...');
        if (fs.existsSync(apiDir)) {
            fs.rmSync(apiDir, { recursive: true, force: true });
        }
        fs.renameSync(apiBackupDir, apiDir);
        console.log('✅ API routes restored');
    }

    process.exit(1);
}
