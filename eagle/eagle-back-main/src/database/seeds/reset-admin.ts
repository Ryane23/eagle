import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRole } from '../../modules/users/entities/user.entity';

// Load environment variables
config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();
firestore.settings({
  databaseId: 'eagles',
});

async function resetAdminUser() {
  const auth = admin.auth();
  const email = 'admin@eagles.com';
  const password = 'Admin@123456';

  try {
    console.log('🔄 Starting admin user reset...\n');

    // Step 1: Delete from Firestore
    console.log('🗑️  Step 1: Checking Firestore for existing admin...');
    const existingAdmin = await firestore
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      const docId = existingAdmin.docs[0].id;
      await firestore.collection('users').doc(docId).delete();
      console.log(`✅ Deleted admin from Firestore (Doc ID: ${docId})`);
    } else {
      console.log('⚠️  No admin found in Firestore');
    }

    // Step 2: Delete from Firebase Auth
    console.log('\n🗑️  Step 2: Checking Firebase Auth for existing admin...');
    let existingUid: string | null = null;
    
    try {
      const authUser = await auth.getUserByEmail(email);
      existingUid = authUser.uid;
      await auth.deleteUser(authUser.uid);
      console.log(`✅ Deleted admin from Firebase Auth (UID: ${authUser.uid})`);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log('⚠️  No admin found in Firebase Auth');
      } else {
        throw authError;
      }
    }

    // Step 3: Create new admin in Firebase Auth
    console.log('\n📝 Step 3: Creating new admin in Firebase Authentication...');
    const newAuthUser = await auth.createUser({
      email,
      password,
      displayName: 'System Administrator',
      disabled: false,
    });
    
    const createdUid = newAuthUser.uid;
    console.log(`✅ Created Firebase Auth user (UID: ${createdUid})`);

    // Step 4: Create new admin in Firestore
    console.log('\n📝 Step 4: Creating admin in Firestore...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = firestore.collection('users').doc(createdUid);
    const now = admin.firestore.Timestamp.now().toDate();

    const adminData = {
      id: createdUid,
      email,
      password: hashedPassword,
      name: 'System Administrator',
      phone: '+237600000000',
      role: UserRole.ADMIN,
      hospitalId: null,
      specialtyId: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(adminData);
    console.log(`✅ Created Firestore document (users/${createdUid})`);

    // Success summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ Admin user successfully reset!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📧 Email: admin@eagles.com');
    console.log('🔑 Password: Admin@123456');
    console.log(`🆔 New User ID (UID): ${createdUid}`);
    console.log(`📍 Firestore Path: users/${createdUid}`);
    
    if (existingUid && existingUid !== createdUid) {
      console.log(`\n⚠️  Note: UID changed from ${existingUid} to ${createdUid}`);
    }
    
    console.log('\n⚠️  IMPORTANT: Please change the admin password after first login!\n');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ Error resetting admin user:', error);
    console.error('\nPlease check:');
    console.error('1. Firebase credentials are correct in .env');
    console.error('2. Firestore database "eagles" exists');
    console.error('3. You have admin permissions in Firebase project\n');
    throw error;
  } finally {
    // Close Firestore connection
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the reset
resetAdminUser();