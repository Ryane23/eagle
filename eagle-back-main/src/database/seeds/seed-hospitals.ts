import * as admin from 'firebase-admin';
import { config } from 'dotenv';
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

const hospitals = [
  {
    name: 'Centre Principal de Yaoundé',
    type: HospitalType.PRIMARY,
    address: 'Boulevard du 20 Mai, Quartier Administratif',
    city: 'Yaoundé',
    country: 'Cameroon',
    contactPhone: '+237222123456',
    contactEmail: 'contact@eagles-yaounde.cm',
    code: 'YDE',
    isActive: true,
    capacity: 50,
  },
  {
    name: 'Centre Secondaire de Douala',
    type: HospitalType.SECONDARY,
    address: 'Rue Joss, Akwa',
    city: 'Douala',
    country: 'Cameroon',
    contactPhone: '+237233234567',
    contactEmail: 'contact@eagles-douala.cm',
    code: 'DLA',
    isActive: true,
    capacity: 30,
  },
  {
    name: 'Centre Secondaire de Bafoussam',
    type: HospitalType.SECONDARY,
    address: 'Avenue Kouandem, Centre Ville',
    city: 'Bafoussam',
    country: 'Cameroon',
    contactPhone: '+237233345678',
    contactEmail: 'contact@eagles-bafoussam.cm',
    code: 'BFM',
    isActive: true,
    capacity: 25,
  },
  {
    name: 'Centre Secondaire de Maroua',
    type: HospitalType.SECONDARY,
    address: 'Quartier Domayo, Avenue du 27 Août',
    city: 'Maroua',
    country: 'Cameroon',
    contactPhone: '+237222456789',
    contactEmail: 'contact@eagles-maroua.cm',
    code: 'MRA',
    isActive: true,
    capacity: 20,
  },
];

async function seedHospitals() {
  try {
    console.log('🌱 Starting hospitals seeding...\n');

    for (const hospital of hospitals) {
      // Check if hospital already exists
      const existingHospital = await firestore
        .collection('hospitals')
        .where('code', '==', hospital.code)
        .limit(1)
        .get();

      if (!existingHospital.empty) {
        console.log(`⚠️  Hospital ${hospital.name} (${hospital.code}) already exists. Skipping...`);
        continue;
      }

      // Create hospital
      const hospitalData = {
        ...hospital,
        createdAt: admin.firestore.Timestamp.now().toDate(),
        updatedAt: admin.firestore.Timestamp.now().toDate(),
      };

      const docRef = await firestore.collection('hospitals').add(hospitalData);
      await docRef.update({ id: docRef.id });

      console.log(`✅ Hospital created: ${hospital.name} (${hospital.code}) - ID: ${docRef.id}`);
    }

    console.log('\n🎉 All hospitals seeded successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
    throw error;
  } finally {
    // Close Firestore connection
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the seeding
seedHospitals();
