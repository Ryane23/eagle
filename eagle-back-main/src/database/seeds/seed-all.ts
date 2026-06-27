import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRole } from '../../modules/users/entities/user.entity';
import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';

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

async function seedAll() {
  try {
    console.log('🌱 Starting complete database seeding...\n');

    // 1. Seed Hospitals
    console.log('📍 Step 1: Seeding Hospitals...');
    const hospitals = [
      {
        name: 'Centre Principal de Yaoundé',
        type: HospitalType.PRIMARY,
        location: 'Yaoundé',
        code: 'YDE',
        address: 'Boulevard du 20 Mai, Yaoundé',
        phone: '+237222123456',
        email: 'contact@eagles-yaounde.cm',
        isActive: true,
        capacity: 50,
      },
      {
        name: 'Centre Secondaire de Douala',
        type: HospitalType.SECONDARY,
        location: 'Douala',
        code: 'DLA',
        address: 'Rue Joss, Douala',
        phone: '+237233234567',
        email: 'contact@eagles-douala.cm',
        isActive: true,
        capacity: 30,
      },
      {
        name: 'Centre Secondaire de Bafoussam',
        type: HospitalType.SECONDARY,
        location: 'Bafoussam',
        code: 'BFM',
        address: 'Avenue Kouandem, Bafoussam',
        phone: '+237233345678',
        email: 'contact@eagles-bafoussam.cm',
        isActive: true,
        capacity: 25,
      },
      {
        name: 'Centre Secondaire de Maroua',
        type: HospitalType.SECONDARY,
        location: 'Maroua',
        code: 'MRA',
        address: 'Quartier Domayo, Maroua',
        phone: '+237222456789',
        email: 'contact@eagles-maroua.cm',
        isActive: true,
        capacity: 20,
      },
    ];

    const hospitalIds: Record<string, string> = {};

    for (const hospital of hospitals) {
      const existingHospital = await firestore
        .collection('hospitals')
        .where('code', '==', hospital.code)
        .limit(1)
        .get();

      if (!existingHospital.empty) {
        hospitalIds[hospital.code] = existingHospital.docs[0].id;
        console.log(`  ⚠️  ${hospital.name} already exists`);
        continue;
      }

      const hospitalData = {
        ...hospital,
        createdAt: admin.firestore.Timestamp.now().toDate(),
        updatedAt: admin.firestore.Timestamp.now().toDate(),
      };

      const docRef = await firestore.collection('hospitals').add(hospitalData);
      await docRef.update({ id: docRef.id });
      hospitalIds[hospital.code] = docRef.id;

      console.log(`  ✅ Created: ${hospital.name}`);
    }

    // 2. Seed Admin User
    console.log('\n👤 Step 2: Seeding Admin User...');
    const adminExists = await firestore
      .collection('users')
      .where('email', '==', 'admin@eagles.com')
      .limit(1)
      .get();

    if (adminExists.empty) {
      const adminData = {
        email: 'admin@eagles.com',
        password: await bcrypt.hash('Admin@123456', 10),
        name: 'System Administrator',
        phone: '+237600000000',
        role: UserRole.ADMIN,
        hospitalId: null,
        specialtyId: null,
        isActive: true,
        createdAt: admin.firestore.Timestamp.now().toDate(),
        updatedAt: admin.firestore.Timestamp.now().toDate(),
      };

      const docRef = await firestore.collection('users').add(adminData);
      await docRef.update({ id: docRef.id });
      console.log('  ✅ Admin user created');
    } else {
      console.log('  ⚠️  Admin user already exists');
    }

    // 3. Seed Sample Users
    console.log('\n👥 Step 3: Seeding Sample Users...');
    const users = [
      {
        email: 'secretary.primary@eagles.com',
        password: 'Primary@123',
        name: 'Marie Dupont',
        phone: '+237655001234',
        role: UserRole.PRIMARY_SECRETARY,
        hospitalId: hospitalIds['YDE'],
      },
      {
        email: 'secretary.douala@eagles.com',
        password: 'Douala@123',
        name: 'Paul Kamga',
        phone: '+237655002345',
        role: UserRole.SECONDARY_SECRETARY,
        hospitalId: hospitalIds['DLA'],
      },
      {
        email: 'nurse.douala@eagles.com',
        password: 'Nurse@123',
        name: 'Grace Mbarga',
        phone: '+237655003456',
        role: UserRole.NURSE,
        hospitalId: hospitalIds['DLA'],
      },
      {
        email: 'doctor.nana@eagles.com',
        password: 'Doctor@123',
        name: 'Dr. Jean Nana',
        phone: '+237655004567',
        role: UserRole.DOCTOR,
        hospitalId: hospitalIds['YDE'],
        specialtyId: null, // Will be set when specialties are created
      },
    ];

    for (const user of users) {
      const existingUser = await firestore
        .collection('users')
        .where('email', '==', user.email)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        console.log(`  ⚠️  ${user.email} already exists`);
        continue;
      }

      const userData = {
        ...user,
        password: await bcrypt.hash(user.password, 10),
        specialtyId: user.specialtyId || null,
        isActive: true,
        createdAt: admin.firestore.Timestamp.now().toDate(),
        updatedAt: admin.firestore.Timestamp.now().toDate(),
      };

      const docRef = await firestore.collection('users').add(userData);
      await docRef.update({ id: docRef.id });
      console.log(`  ✅ Created: ${user.name} (${user.role})`);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📝 DEFAULT CREDENTIALS:');
    console.log('═══════════════════════════════════════════════');
    console.log('\n👤 Admin:');
    console.log('   Email: admin@eagles.com');
    console.log('   Password: Admin@123456\n');
    console.log('👤 Primary Secretary:');
    console.log('   Email: secretary.primary@eagles.com');
    console.log('   Password: Primary@123\n');
    console.log('👤 Secondary Secretary (Douala):');
    console.log('   Email: secretary.douala@eagles.com');
    console.log('   Password: Douala@123\n');
    console.log('👤 Nurse (Douala):');
    console.log('   Email: nurse.douala@eagles.com');
    console.log('   Password: Nurse@123\n');
    console.log('👤 Doctor:');
    console.log('   Email: doctor.nana@eagles.com');
    console.log('   Password: Doctor@123\n');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the seeding
seedAll();
