#!/usr/bin/env node

/**
 * Build Release Script - Litra Glow Stream Deck Plugin
 * 
 * Builds and packages the plugin for distribution
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building Litra Glow Plugin Release...\n');

try {
    // Step 1: Build TypeScript
    console.log('📦 Step 1: Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ TypeScript build complete\n');
    
    // Step 2: Validate plugin
    console.log('🔍 Step 2: Validating plugin...');
    execSync('streamdeck validate com.litra.glow.v2.sdPlugin', { stdio: 'inherit' });
    console.log('✅ Plugin validation successful\n');
    
    // Step 3: Package plugin
    console.log('📦 Step 3: Packaging plugin...');
    execSync('streamdeck pack com.litra.glow.v2.sdPlugin --force', { stdio: 'inherit' });
    console.log('✅ Plugin packaged successfully\n');
    
    // Step 4: Show package info
    const packagePath = './com.litra.glow.v2.streamDeckPlugin';
    if (fs.existsSync(packagePath)) {
        const stats = fs.statSync(packagePath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log('📊 Package Information:');
        console.log(`   File: com.litra.glow.v2.streamDeckPlugin`);
        console.log(`   Size: ${sizeKB} KB`);
        console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
    }
    
    console.log('\n🎉 Release build complete!');
    console.log('💡 To install: Double-click com.litra.glow.v2.streamDeckPlugin');
    
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
} 