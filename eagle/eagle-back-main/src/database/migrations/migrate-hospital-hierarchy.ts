import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildHospitalHierarchyMigrationPlan,
  LegacyHospital,
} from './hospital-hierarchy-migration';

config();

function getArgument(name: string): string | undefined {
  const inlinePrefix = `--${name}=`;
  const inline = process.argv.find((argument) =>
    argument.startsWith(inlinePrefix),
  );
  if (inline) return inline.slice(inlinePrefix.length);

  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function loadParentMap(): Record<string, string> {
  const file = getArgument('parent-map');
  if (!file) return {};

  const contents = readFileSync(resolve(file), 'utf8');
  const parsed: unknown = JSON.parse(contents);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Parent map must be a JSON object');
  }

  return parsed as Record<string, string>;
}

async function migrateHospitalHierarchy() {
  const apply = process.argv.includes('--apply');
  const databaseId = process.env.FIRESTORE_DATABASE_ID ?? 'eagles';

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
  firestore.settings({ databaseId, ignoreUndefinedProperties: true });

  try {
    const snapshot = await firestore.collection('hospitals').get();
    const hospitals = snapshot.docs.map(
      (document) =>
        ({
          id: document.id,
          ...document.data(),
        }) as LegacyHospital,
    );
    const plan = buildHospitalHierarchyMigrationPlan(
      hospitals,
      loadParentMap(),
    );

    console.log(
      `Hospital hierarchy migration (${apply ? 'APPLY' : 'DRY RUN'})`,
    );
    console.log(`Database: ${databaseId}`);
    console.log(`Hospitals scanned: ${hospitals.length}`);
    console.log(`Updates planned: ${plan.updates.length}`);
    console.log(`Already valid: ${plan.unchanged.length}`);

    for (const update of plan.updates) {
      const inference = update.parentWasInferred
        ? ' (single PRIMARY inferred)'
        : '';
      console.log(
        `UPDATE ${update.id} ${update.name}${inference}: ${JSON.stringify(update.changes)}`,
      );
    }

    if (plan.errors.length > 0) {
      console.error(`Errors: ${plan.errors.length}`);
      for (const error of plan.errors) console.error(`ERROR ${error}`);
      throw new Error('Migration plan contains errors; no writes were made');
    }

    if (!apply) {
      console.log(
        'Dry run complete. Re-run with --apply to write these changes.',
      );
      return;
    }

    for (let start = 0; start < plan.updates.length; start += 500) {
      const batch = firestore.batch();
      const updates = plan.updates.slice(start, start + 500);
      for (const update of updates) {
        batch.update(firestore.collection('hospitals').doc(update.id), {
          ...update.changes,
          updatedAt: admin.firestore.Timestamp.now().toDate(),
        });
      }
      await batch.commit();
    }

    console.log(
      `Migration complete. Updated ${plan.updates.length} hospitals.`,
    );
  } finally {
    await admin.app().delete();
  }
}

migrateHospitalHierarchy().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Hospital migration failed',
  );
  process.exitCode = 1;
});
