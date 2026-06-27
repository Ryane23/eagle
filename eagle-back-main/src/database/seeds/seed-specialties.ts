/**
 * Seed default specialties. Safe to run multiple times (upserts by name).
 * Run before seed:doctors so doctors can reference specialtyId.
 *
 * Run: npm run seed:specialties
 */

import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const COLLECTION = 'specialties';

const DEFAULT_SPECIALTIES: { name: string; description?: string; displayOrder: number }[] = [
  { name: 'Médecine Générale', description: 'Médecine générale et soins primaires', displayOrder: 1 },
  { name: 'Pédiatrie', description: 'Soins aux enfants', displayOrder: 2 },
  { name: 'Cardiologie', description: 'Cœur et système cardiovasculaire', displayOrder: 3 },
  { name: 'Dermatologie', description: 'Peau et affections cutanées', displayOrder: 4 },
  { name: 'Gynécologie-Obstétrique', description: 'Santé des femmes et grossesse', displayOrder: 5 },
  { name: 'Traumatologie', description: 'Blessures et urgences traumatiques', displayOrder: 6 },
  { name: 'Psychiatrie', description: 'Santé mentale', displayOrder: 7 },
  { name: 'Radiologie', description: 'Imagerie médicale', displayOrder: 8 },
];

export type SpecialtyIdMap = Record<string, string>;

export async function ensureSpecialties(
  firestore: admin.firestore.Firestore,
): Promise<SpecialtyIdMap> {
  const map: SpecialtyIdMap = {};

  for (const spec of DEFAULT_SPECIALTIES) {
    const existing = await firestore
      .collection(COLLECTION)
      .where('name', '==', spec.name)
      .limit(1)
      .get();

    const now = admin.firestore.Timestamp.now().toDate();
    const data = {
      name: spec.name,
      description: spec.description ?? null,
      icon: null,
      isActive: true,
      displayOrder: spec.displayOrder,
      createdAt: now,
      updatedAt: now,
    };

    if (!existing.empty) {
      const id = existing.docs[0].id;
      map[spec.name] = id;
      await existing.docs[0].ref.update({ ...data, updatedAt: now });
      continue;
    }

    const docRef = await firestore.collection(COLLECTION).add(data);
    await docRef.update({ id: docRef.id });
    map[spec.name] = docRef.id;
  }

  return map;
}

async function runStandalone() {
  const firestore = admin.firestore();
  console.log('🌱 Seeding specialties...\n');

  const ids = await ensureSpecialties(firestore);

  console.log('✅ Specialties ready:\n');
  for (const spec of DEFAULT_SPECIALTIES) {
    console.log(`   ${spec.name} → ${ids[spec.name]}`);
  }
  console.log('');

  await admin.app().delete();
  process.exit(0);
}

if (require.main === module) {
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

  runStandalone().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
