#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Firebase Configuration...\n');

// Read .env file
const envPath = path.join(__dirname, '..', '..', '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    env[key] = value;
  }
});

// Check required Firebase variables
const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

let allGood = true;

required.forEach(key => {
  if (!env[key]) {
    console.log(`❌ Missing: ${key}`);
    allGood = false;
  } else if (env[key].includes('...')) {
    console.log(`❌ ${key} contains placeholder text`);
    console.log(`   Current value has "...rest of key..." which needs to be replaced`);
    allGood = false;
  } else {
    console.log(`✅ ${key} is set`);
  }
});

// Check JWT variables
console.log('\n📝 JWT Configuration:');
if (env.JWT_SECRET) {
  console.log(`✅ JWT_SECRET is set (${env.JWT_SECRET.length} characters)`);
} else {
  console.log('❌ JWT_SECRET is missing');
  allGood = false;
}

if (env.JWT_EXPIRATION) {
  console.log(`✅ JWT_EXPIRATION: ${env.JWT_EXPIRATION}`);
} else {
  console.log('⚠️  JWT_EXPIRATION not set (will use default: 1h)');
}

if (env.JWT_REFRESH_EXPIRATION) {
  console.log(`✅ JWT_REFRESH_EXPIRATION: ${env.JWT_REFRESH_EXPIRATION}`);
} else {
  console.log('⚠️  JWT_REFRESH_EXPIRATION not set (will use default: 7d)');
}

// Check Encryption Key
console.log('\n🔐 Encryption Configuration:');
if (env.ENCRYPTION_KEY) {
  if (env.ENCRYPTION_KEY.length === 32) {
    console.log(`✅ ENCRYPTION_KEY is set (32 characters for AES-256)`);
  } else {
    console.log(`❌ ENCRYPTION_KEY must be exactly 32 characters`);
    console.log(`   Current length: ${env.ENCRYPTION_KEY.length}`);
    allGood = false;
  }
} else {
  console.log('❌ ENCRYPTION_KEY is missing');
  allGood = false;
}

// Final status
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All configuration checks passed!');
  console.log('\nYou can now run:');
  console.log('  npm run seed:all    # Seed the database');
  console.log('  npm run start:dev   # Start the server');
} else {
  console.log('❌ Configuration issues found!');
  console.log('\nPlease fix the issues above before running the application.');
  console.log('\nTo get your Firebase private key:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select project: eagles-5c818');
  console.log('3. Go to Project Settings → Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Download the JSON file');
  console.log('6. Copy the private_key value to FIREBASE_PRIVATE_KEY in .env');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
