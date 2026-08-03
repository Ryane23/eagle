import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { VisitStatus, VisitType } from '../../modules/visits/entities/visit.entity';

config();

async function migrateActiveWorkflows() {
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
    const [queueSnapshot, consultationSnapshot] = await Promise.all([
      firestore.collection('queue').where('status', 'in', ['waiting', 'in_progress']).get(),
      firestore
        .collection('consultations')
        .where('status', 'in', ['scheduled', 'in_progress'])
        .get(),
    ]);
    const records = [
      ...consultationSnapshot.docs.map((doc) => ({ kind: 'consultation', doc })),
      ...queueSnapshot.docs.map((doc) => ({ kind: 'queue', doc })),
    ];
    const visitByConsultation = new Map<string, string>();
    let planned = 0;
    let skipped = 0;

    console.log(`Active workflow migration (${apply ? 'APPLY' : 'DRY RUN'})`);
    console.log(`Database: ${databaseId}`);

    for (const record of records) {
      const data = record.doc.data();
      if (data.visitId) {
        if (record.kind === 'consultation') {
          visitByConsultation.set(record.doc.id, data.visitId);
        }
        skipped += 1;
        continue;
      }
      const linkedVisitId =
        record.kind === 'queue' && data.consultationId
          ? visitByConsultation.get(data.consultationId)
          : undefined;
      if (linkedVisitId) {
        planned += 1;
        console.log(
          `LINK queue/${record.doc.id} to visit=${linkedVisitId}`,
        );
        if (apply) {
          await record.doc.ref.update({
            visitId: linkedVisitId,
            updatedAt: new Date(),
          });
        }
        continue;
      }
      const patient = await firestore.collection('patients').doc(data.patientId).get();
      if (!patient.exists || patient.data()?.isActive === false) {
        skipped += 1;
        continue;
      }
      const originHospitalId = data.originHospitalId || patient.data()?.hospitalId;
      if (!originHospitalId) {
        skipped += 1;
        continue;
      }

      planned += 1;
      console.log(
        `BACKFILL ${record.kind}/${record.doc.id} patient=${data.patientId} hospital=${originHospitalId}`,
      );
      if (!apply) continue;

      const visitRef = firestore.collection('visits').doc();
      const now = new Date();
      const batch = firestore.batch();
      batch.set(visitRef, {
        id: visitRef.id,
        patientId: data.patientId,
        originHospitalId,
        type: data.appointmentId
          ? VisitType.APPOINTMENT
          : data.referralId
            ? VisitType.REFERRAL
            : VisitType.WALK_IN,
        status:
          record.kind === 'consultation' && data.status === 'in_progress'
            ? VisitStatus.IN_CONSULTATION
            : VisitStatus.QUEUED,
        complaint: 'Legacy active workflow',
        specialtyId: data.specialtyId || null,
        consultationId:
          record.kind === 'consultation'
            ? record.doc.id
            : data.consultationId || null,
        appointmentId: data.appointmentId || null,
        referralId: data.referralId || null,
        urgencyId: data.urgencyId || null,
        boxId: data.boxId || null,
        createdBy: 'workflow-migration',
        createdByRole: 'system',
        createdAt: data.createdAt || now,
        updatedAt: now,
      });
      batch.update(record.doc.ref, {
        visitId: visitRef.id,
        originHospitalId,
        updatedAt: now,
      });
      await batch.commit();
      if (record.kind === 'consultation') {
        visitByConsultation.set(record.doc.id, visitRef.id);
      }
    }

    console.log(`Planned: ${planned}; skipped: ${skipped}`);
    if (!apply) {
      console.log('Dry run complete. Re-run with --apply to write changes.');
    }
  } finally {
    await admin.app().delete();
  }
}

migrateActiveWorkflows().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
