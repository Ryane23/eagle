/**
 * Clear all Firestore collections in the "eagles" database.
 * Use for local/dev reset. Does NOT delete Firebase Auth users.
 *
 * Run: npm run db:clear
 */

import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const FIRESTORE_BATCH_SIZE = 500;

const COLLECTIONS = [
  'activities',
  'auth_tokens',
  'calendar_events',
  'complaints',
  'consultations',
  'files',
  'followups',
  'help_articles',
  'faqs',
  'hospitals',
  'messages',
  'webrtc_rooms',
  'notifications',
  'patients',
  'preparations',
  'prescriptions',
  'queue',
  'referrals',
  'reports',
  'rules',
  'specialties',
  'sync_operations',
  'hospital_module_configs',
  'system_modules',
  'system_settings',
  'tickets',
  'urgencies',
  // 'users',
  'permissions',
  'role_permissions',
];

async function deleteCollection(
  firestore: admin.firestore.Firestore,
  collectionPath: string,
): Promise<number> {
  const col = firestore.collection(collectionPath);
  let deleted = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snapshot = await col.limit(FIRESTORE_BATCH_SIZE).get();
    if (snapshot.empty) break;

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleted++;
    });
    await batch.commit();
  }

  return deleted;
}

async function clearFirestore() {
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

  console.log('🗑️  Clearing Firestore database (eagles)...\n');

  let totalDeleted = 0;
  for (const name of COLLECTIONS) {
    try {
      const count = await deleteCollection(firestore, name);
      if (count > 0) {
        console.log(`  ✅ ${name}: ${count} document(s) deleted`);
        totalDeleted += count;
      }
    } catch (e) {
      console.error(`  ❌ ${name}: ${(e as Error).message}`);
    }
  }

  console.log(`\n✅ Done. Total documents deleted: ${totalDeleted}`);
  console.log('\n⚠️  Firebase Authentication users were NOT deleted.');
  console.log(
    '   To remove Auth users: Firebase Console → Authentication → Users.\n',
  );

  await admin.app().delete();
  process.exit(0);
}

clearFirestore().catch((err) => {
  console.error(err);
  process.exit(1);
});
