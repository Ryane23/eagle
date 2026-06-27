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
  databaseId: 'eagles',  // Add this line
});

async function seedAdminUser() {
  const auth = admin.auth();
  const email = 'admin@eagles.com';
  const password = 'Admin@123456';
  let createdUid: string | undefined;

  try {
    console.log('🌱 Starting admin user seeding...\n');

    // Check if admin already exists in Firestore
    const existingAdmin = await firestore
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      console.log('⚠️  Admin user already exists in Firestore. Skipping...');
      return;
    }

    // Check if admin exists in Firebase Auth
    try {
      const authUser = await auth.getUserByEmail(email);
      console.log(`⚠️  Admin user already exists in Firebase Auth with UID: ${authUser.uid}`);
      createdUid = authUser.uid;
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log('📝 Creating new admin user in Firebase Authentication...');
        
        // Create Firebase Authentication user
        const authUser = await auth.createUser({
          email,
          password,
          displayName: 'System Administrator',
          disabled: false,
        });
        
        createdUid = authUser.uid;
        console.log(`✅ Firebase Auth user created with UID: ${createdUid}`);
      } else {
        throw authError;
      }
    }

    // Hash password for Firestore storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Firestore user document using the same UID
    console.log('📝 Creating admin user in Firestore...');
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

    console.log('\n✅ Admin user created successfully in both Firebase Auth and Firestore!');
    console.log('\n📧 Email: admin@eagles.com');
    console.log('🔑 Password: Admin@123456');
    console.log(`🆔 User ID (UID): ${createdUid}`);
    console.log(`📍 Firestore Path: users/${createdUid}\n`);
    
    console.log('⚠️  IMPORTANT: Please change the admin password after first login!\n');
  } catch (error: any) {
    console.error('❌ Error seeding admin user:', error);
    
    // Rollback: If Firestore creation failed but Auth user was created, delete the Auth user
    if (createdUid && error.code !== 'auth/email-already-exists') {
      try {
        await auth.deleteUser(createdUid);
        console.log('🔄 Rolled back: Deleted Firebase Auth user due to Firestore error');
      } catch (rollbackError) {
        console.error('⚠️  Failed to rollback Auth user:', rollbackError);
      }
    }
    
    throw error;
  } finally {
    // Close Firestore connection
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the seeding
seedAdminUser();
