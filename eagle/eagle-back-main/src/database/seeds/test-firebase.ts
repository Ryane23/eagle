import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🔍 Testing Firebase Connection...\n');

try {
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  console.log('✅ Firebase Admin SDK initialized successfully!');
  console.log(`📦 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`📧 Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
  
  const firestore = admin.firestore();
  const databaseId = process.env.FIRESTORE_DATABASE_ID || 'eagles';
  firestore.settings({ databaseId });
  
  // Try to access Firestore
  console.log(`\n🔍 Testing Firestore connection (${databaseId})...`);
  
  firestore.collection('_test_').limit(1).get().then((snapshot) => {
    console.log('✅ Firestore connection successful!');
    console.log(`📄 Documents found in probe collection: ${snapshot.size}`);
    console.log('\n✅ Firebase connection test passed!\n');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Firestore error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Firestore database is created in Firebase Console');
    console.error('   2. Database is in "eagles" (default) location');
    console.error('   3. Service account has Firestore permissions\n');
    process.exit(1);
  });

} catch (error: any) {
  console.error('❌ Firebase initialization error:', error.message);
  console.error('\n💡 Check your .env file configuration\n');
  process.exit(1);
}
