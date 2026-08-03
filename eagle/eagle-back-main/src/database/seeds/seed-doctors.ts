/**
 * Create one doctor per specialty (Firebase Auth + Firestore).
 * Ensures specialties and at least one hospital exist, then creates doctors.
 * Run after seed:specialties and seed:auth-roles (or seed:all) for a full DB.
 *
 * Run: npm run seed:doctors
 */

import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRole } from '../../modules/users/entities/user.entity';
import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';
import { ensureSpecialties } from './seed-specialties';

config();

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
const auth = admin.auth();

async function ensureOneHospital(): Promise<string> {
  const existing = await firestore
    .collection('hospitals')
    .where('code', '==', 'YDE')
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const now = admin.firestore.Timestamp.now().toDate();
  const docRef = await firestore.collection('hospitals').add({
    name: 'Centre Principal de Yaoundé',
    type: HospitalType.PRIMARY,
    parentHospitalId: null,
    location: 'Yaoundé',
    code: 'YDE',
    address: 'Boulevard du 20 Mai, Yaoundé',
    phone: '+237222123456',
    email: 'contact@eagles-yaounde.cm',
    isActive: true,
    capacity: 50,
    createdAt: now,
    updatedAt: now,
  });
  await docRef.update({ id: docRef.id });
  return docRef.id;
}

type DoctorAccount = { email: string; password: string; name: string; specialty: string; specialtyId: string };

async function ensureAuthUser(email: string, password: string, name: string): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(email);
    return existing.uid;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code !== 'auth/user-not-found') throw err;
  }

  const created = await auth.createUser({
    email,
    password,
    displayName: name,
    disabled: false,
  });
  return created.uid;
}

async function upsertFirestoreDoctor(
  uid: string,
  email: string,
  password: string,
  name: string,
  hospitalId: string,
  specialtyId: string,
) {
  const userRef = firestore.collection('users').doc(uid);
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = admin.firestore.Timestamp.now().toDate();

  await userRef.set(
    {
      id: uid,
      email,
      password: hashedPassword,
      name,
      phone: null,
      role: UserRole.DOCTOR,
      hospitalId,
      specialtyId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function run() {
  console.log('🌱 Seeding doctors (one per specialty)...\n');

  const specialtyIds = await ensureSpecialties(firestore);
  const hospitalId = await ensureOneHospital();

  const doctors: DoctorAccount[] = [];
  const defaultPassword = 'Doctor@123';

  for (const [specialtyName, specialtyId] of Object.entries(specialtyIds)) {
    const safeName = slug(specialtyName);
    const email = `doctor.${safeName}@eagles.com`;
    const name = `Dr. ${specialtyName}`;

    const uid = await ensureAuthUser(email, defaultPassword, name);
    await upsertFirestoreDoctor(uid, email, defaultPassword, name, hospitalId, specialtyId);

    doctors.push({ email, password: defaultPassword, name, specialty: specialtyName, specialtyId });
    console.log(`  ✅ ${name} (${email})`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 DOCTOR ACCOUNTS (one per specialty)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   Password for all: ' + defaultPassword + '\n');
  console.log('   Email                      | Specialty');
  console.log('   ---------------------------|----------------------------------');
  for (const d of doctors) {
    console.log(`   ${d.email.padEnd(27)} | ${d.specialty}`);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  await admin.app().delete();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
