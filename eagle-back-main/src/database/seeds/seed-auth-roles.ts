import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRole } from '../../modules/users/entities/user.entity';
import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';

config();

// Init Firebase Admin
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
firestore.settings({ databaseId: 'eagles' });

type SeedHospital = {
  name: string;
  type: HospitalType;
  location: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  capacity: number;
};

type SeedUser = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  hospitalCode?: string; // map to hospitalId
  specialtyId?: string | null;
};

async function ensureHospitals(): Promise<Record<string, string>> {
  const hospitals: SeedHospital[] = [
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
    const existing = await firestore
      .collection('hospitals')
      .where('code', '==', hospital.code)
      .limit(1)
      .get();

    if (!existing.empty) {
      hospitalIds[hospital.code] = existing.docs[0].id;
      continue;
    }

    const now = admin.firestore.Timestamp.now().toDate();
    const docRef = await firestore.collection('hospitals').add({
      ...hospital,
      createdAt: now,
      updatedAt: now,
    });
    await docRef.update({ id: docRef.id });
    hospitalIds[hospital.code] = docRef.id;
  }

  return hospitalIds;
}

async function ensureAuthUser(user: SeedUser): Promise<string> {
  const auth = admin.auth();

  try {
    const existing = await auth.getUserByEmail(user.email);
    return existing.uid;
  } catch (err: any) {
    if (err?.code !== 'auth/user-not-found') throw err;
  }

  const created = await auth.createUser({
    email: user.email,
    password: user.password,
    displayName: user.name,
    phoneNumber: user.phone || undefined,
    disabled: false,
  });

  return created.uid;
}

async function upsertFirestoreUser(uid: string, user: SeedUser, hospitalIds: Record<string, string>) {
  const userRef = firestore.collection('users').doc(uid);
  const snapshot = await userRef.get();

  const now = admin.firestore.Timestamp.now().toDate();
  const createdAt = snapshot.exists
    ? ((snapshot.data() as any)?.createdAt ?? now)
    : now;

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const hospitalId = user.hospitalCode ? hospitalIds[user.hospitalCode] ?? null : null;

  await userRef.set(
    {
      id: uid,
      email: user.email,
      password: hashedPassword,
      name: user.name,
      phone: user.phone ?? null,
      role: user.role,
      hospitalId,
      specialtyId: user.specialtyId ?? null,
      isActive: true,
      createdAt,
      updatedAt: now,
    },
    { merge: true },
  );

  // Optional but useful (for Firebase rules / clients later)
  await admin
    .auth()
    .setCustomUserClaims(uid, {
      role: user.role,
      hospitalId,
    })
    .catch(() => undefined);
}

async function seedAuthRoles() {
  console.log('🌱 Seeding Auth + Firestore users for all roles...\n');

  const hospitalIds = await ensureHospitals();

  const users: SeedUser[] = [
    {
      email: 'admin@eagles.com',
      password: 'Admin@123456',
      name: 'System Administrator',
      phone: '+237600000000',
      role: UserRole.ADMIN,
    },
    {
      email: 'secretary.primary@eagles.com',
      password: 'Primary@123',
      name: 'Marie Dupont',
      phone: '+237655001234',
      role: UserRole.PRIMARY_SECRETARY,
      hospitalCode: 'YDE',
    },
    {
      email: 'secretary.douala@eagles.com',
      password: 'Douala@123',
      name: 'Paul Kamga',
      phone: '+237655002345',
      role: UserRole.SECONDARY_SECRETARY,
      hospitalCode: 'DLA',
    },
    {
      email: 'nurse.douala@eagles.com',
      password: 'Nurse@123',
      name: 'Grace Mbarga',
      phone: '+237655003456',
      role: UserRole.NURSE,
      hospitalCode: 'DLA',
    },
    {
      email: 'doctor.nana@eagles.com',
      password: 'Doctor@123',
      name: 'Dr. Jean Nana',
      phone: '+237655004567',
      role: UserRole.DOCTOR,
      hospitalCode: 'YDE',
      specialtyId: null,
    },
  ];

  for (const u of users) {
    const uid = await ensureAuthUser(u);
    await upsertFirestoreUser(uid, u, hospitalIds);
    console.log(`✅ ${u.role} -> ${u.email} (uid=${uid})`);
  }

  console.log('\nDone. These users now exist in:');
  console.log('- Firebase Authentication (Users)');
  console.log('- Firestore (users collection)\n');
}

seedAuthRoles()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete().catch(() => undefined);
    process.exit();
  });