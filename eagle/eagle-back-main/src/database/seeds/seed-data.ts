/**
 * Seed consistent data: patients, consultations, queue, referrals,
 * notifications, activities, prescriptions, followups.
 * Run after seed:full (hospitals, specialties, users must exist).
 *
 * Run: npm run seed:data
 */

import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { UserRole } from '../../modules/users/entities/user.entity';
import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';
import { ConsultationStatus, ConsultationType } from '../../modules/consultations/entities/consultation.entity';
import { QueueStatus, QueuePriority } from '../../modules/queue/entities/queue.entity';
import { ReferralStatus, ReferralPriority } from '../../modules/referrals/entities/referral.entity';
import { NotificationType } from '../../modules/notifications/entities/notification.entity';
import { ActivityType, ActivityResource } from '../../modules/activities/entities/activity.entity';
import { FollowupStatus } from '../../modules/followups/entities/followup.entity';
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

const now = () => admin.firestore.Timestamp.now().toDate();

async function getHospitalIds(): Promise<Record<string, string>> {
  const snap = await firestore.collection('hospitals').get();
  const byCode: Record<string, string> = {};
  snap.docs.forEach((d) => {
    const data = d.data() as { code?: string };
    if (data.code) byCode[data.code] = d.id;
  });
  return byCode;
}

async function getSpecialtyIds(firestoreInstance: admin.firestore.Firestore): Promise<Record<string, string>> {
  return ensureSpecialties(firestoreInstance);
}

async function getUsersByRole(): Promise<{
  doctors: { id: string; specialtyId: string | null }[];
  nurse: { id: string } | null;
  primarySecretary: { id: string } | null;
  admin: { id: string } | null;
}> {
  const snap = await firestore.collection('users').get();
  const doctors: { id: string; specialtyId: string | null }[] = [];
  let nurse: { id: string } | null = null;
  let primarySecretary: { id: string } | null = null;
  let adminUser: { id: string } | null = null;

  snap.docs.forEach((d) => {
    const data = d.data() as { role?: string; specialtyId?: string | null; email?: string };
    const id = d.id;
    if (data.role === UserRole.DOCTOR) {
      doctors.push({ id, specialtyId: data.specialtyId ?? null });
    } else if (data.role === UserRole.NURSE) nurse = { id };
    else if (data.role === UserRole.PRIMARY_SECRETARY) primarySecretary = { id };
    else if (data.role === UserRole.ADMIN) adminUser = { id };
  });

  return { doctors, nurse, primarySecretary, admin: adminUser };
}

async function seedPatients(hospitalIds: Record<string, string>): Promise<string[]> {
  const yde = hospitalIds['YDE'] || Object.values(hospitalIds)[0];
  if (!yde) {
    console.log('  ⚠️  No hospital found; skipping patients');
    return [];
  }

  const patients = [
    { firstName: 'Marie', lastName: 'Mbarga', dateOfBirth: '1985-03-12', idNumber: 'ID001001001', phone: '+237699111001' },
    { firstName: 'Jean', lastName: 'Kamga', dateOfBirth: '1990-07-22', idNumber: 'ID001001002', phone: '+237699111002' },
    { firstName: 'Sophie', lastName: 'Ngo Biyong', dateOfBirth: '1978-11-05', idNumber: 'ID001001003', phone: '+237699111003' },
    { firstName: 'Paul', lastName: 'Fotso', dateOfBirth: '2000-01-18', idNumber: 'ID001001004', phone: '+237699111004' },
    { firstName: 'Grace', lastName: 'Mefire', dateOfBirth: '1992-09-30', idNumber: 'ID001001005', phone: '+237699111005' },
    { firstName: 'Emmanuel', lastName: 'Tchakounte', dateOfBirth: '1988-05-14', idNumber: 'ID001001006', phone: '+237699111006' },
    { firstName: 'Claudine', lastName: 'Nguema', dateOfBirth: '1995-08-20', idNumber: 'ID001001007', phone: '+237699111007' },
    { firstName: 'André', lastName: 'Mballa', dateOfBirth: '1972-12-03', idNumber: 'ID001001008', phone: '+237699111008' },
    { firstName: 'Brigitte', lastName: 'Owona', dateOfBirth: '1999-02-28', idNumber: 'ID001001009', phone: '+237699111009' },
    { firstName: 'Samuel', lastName: 'Nkoulou', dateOfBirth: '1982-07-11', idNumber: 'ID001001010', phone: '+237699111010' },
    { firstName: 'Martine', lastName: 'Essono', dateOfBirth: '1991-04-25', idNumber: 'ID001001011', phone: '+237699111011' },
    { firstName: 'Pierre', lastName: 'Abega', dateOfBirth: '1965-09-17', idNumber: 'ID001001012', phone: '+237699111012' },
    { firstName: 'Françoise', lastName: 'Mebiame', dateOfBirth: '1987-11-30', idNumber: 'ID001001013', phone: '+237699111013' },
    { firstName: 'David', lastName: 'Eto\'o', dateOfBirth: '2002-01-08', idNumber: 'ID001001014', phone: '+237699111014' },
    { firstName: 'Sylvie', lastName: 'Ndi', dateOfBirth: '1979-06-22', idNumber: 'ID001001015', phone: '+237699111015' },
    { firstName: 'Joseph', lastName: 'Song', dateOfBirth: '1993-10-15', idNumber: 'ID001001016', phone: '+237699111016' },
    { firstName: 'Cécile', lastName: 'Tataw', dateOfBirth: '1984-03-07', idNumber: 'ID001001017', phone: '+237699111017' },
    { firstName: 'Michel', lastName: 'Nkoudou', dateOfBirth: '1976-08-19', idNumber: 'ID001001018', phone: '+237699111018' },
    { firstName: 'Anne', lastName: 'Kameni', dateOfBirth: '1998-12-01', idNumber: 'ID001001019', phone: '+237699111019' },
    { firstName: 'Roger', lastName: 'Milla', dateOfBirth: '1952-05-20', idNumber: 'ID001001020', phone: '+237699111020' },
    { firstName: 'Chantal', lastName: 'Biyong', dateOfBirth: '1990-07-04', idNumber: 'ID001001021', phone: '+237699111021' },
    { firstName: 'Patrick', lastName: 'Mboma', dateOfBirth: '1970-11-15', idNumber: 'ID001001022', phone: '+237699111022' },
    { firstName: 'Véronique', lastName: 'Nkili', dateOfBirth: '1986-02-28', idNumber: 'ID001001023', phone: '+237699111023' },
    { firstName: 'Jacques', lastName: 'Songo\'o', dateOfBirth: '1969-04-12', idNumber: 'ID001001024', phone: '+237699111024' },
    { firstName: 'Hélène', lastName: 'Foe', dateOfBirth: '1994-09-06', idNumber: 'ID001001025', phone: '+237699111025' },
    { firstName: 'Daniel', lastName: 'Ngom', dateOfBirth: '1981-11-23', idNumber: 'ID001001026', phone: '+237699111026' },
    { firstName: 'Monique', lastName: 'Tchatchouang', dateOfBirth: '1996-05-17', idNumber: 'ID001001027', phone: '+237699111027' },
    { firstName: 'Bernard', lastName: 'Tchoutou', dateOfBirth: '1974-01-30', idNumber: 'ID001001028', phone: '+237699111028' },
    { firstName: 'Thérèse', lastName: 'Enganamouit', dateOfBirth: '1992-08-14', idNumber: 'ID001001029', phone: '+237699111029' },
    { firstName: 'Alain', lastName: 'N\'Kong', dateOfBirth: '1979-12-09', idNumber: 'ID001001030', phone: '+237699111030' },
  ];

  const ids: string[] = [];
  for (const p of patients) {
    const existing = await firestore.collection('patients').where('idNumber', '==', p.idNumber).limit(1).get();
    if (!existing.empty) {
      ids.push(existing.docs[0].id);
      continue;
    }
    const docRef = await firestore.collection('patients').add({
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: new Date(p.dateOfBirth),
      idNumber: p.idNumber,
      phone: p.phone,
      hospitalId: yde,
      isActive: true,
      identityVerified: true,
      createdAt: now(),
      updatedAt: now(),
    });
    await docRef.update({ id: docRef.id });
    ids.push(docRef.id);
  }
  return ids;
}

const SYMPTOMS = [
  'Douleurs abdominales',
  'Fièvre et maux de tête',
  'Toux persistante',
  'Douleurs thoraciques',
  'Problèmes cutanés',
  'Consultation de suivi',
  'Douleurs articulaires',
  'Troubles digestifs',
  'Vertiges',
  'Fatigue générale',
];

async function seedConsultations(
  patientIds: string[],
  doctors: { id: string; specialtyId: string | null }[],
  specialtyIdMap: Record<string, string>,
): Promise<{ id: string; patientId: string; doctorId: string; specialtyId: string; status: string; scheduledAt: Date }[]> {
  if (patientIds.length === 0 || doctors.length === 0) return [];
  const created: { id: string; patientId: string; doctorId: string; specialtyId: string; status: string; scheduledAt: Date }[] = [];
  const specialtyIds = Object.values(specialtyIdMap);

  // Mix of statuses: 2 in_progress, most scheduled (waiting), a few completed — so waiting room is full
  const statusTemplate: ConsultationStatus[] = [
    ConsultationStatus.IN_PROGRESS,   // 1
    ConsultationStatus.IN_PROGRESS, // 2
    ...Array(22).fill(ConsultationStatus.SCHEDULED),
    ...Array(6).fill(ConsultationStatus.COMPLETED),
  ];

  for (let i = 0; i < patientIds.length; i++) {
    const patientId = patientIds[i];
    const doctor = doctors[i % doctors.length];
    const specialtyId = doctor.specialtyId || specialtyIds[i % specialtyIds.length];
    const scheduledAt = new Date(Date.now() + (i - 15) * 15 * 60 * 1000); // spread ± ~3.5h in 15-min slots
    const status = statusTemplate[i % statusTemplate.length] ?? ConsultationStatus.SCHEDULED;
    const symptoms = SYMPTOMS[i % SYMPTOMS.length];

    const docRef = await firestore.collection('consultations').add({
      patientId,
      doctorId: doctor.id,
      specialtyId,
      type: ConsultationType.VIDEO,
      status,
      scheduledAt,
      startedAt: status !== ConsultationStatus.SCHEDULED ? scheduledAt : null,
      endedAt: status === ConsultationStatus.COMPLETED ? new Date(scheduledAt.getTime() + 20 * 60000) : null,
      symptoms,
      createdAt: now(),
      updatedAt: now(),
    });
    await docRef.update({ id: docRef.id });
    created.push({
      id: docRef.id,
      patientId,
      doctorId: doctor.id,
      specialtyId,
      status,
      scheduledAt,
    });
  }
  return created;
}

async function seedQueue(consultations: { id: string; patientId: string; specialtyId: string; status: string }[]): Promise<void> {
  const waitingOrInProgress = consultations.filter(
    (c) => c.status === ConsultationStatus.SCHEDULED || c.status === ConsultationStatus.IN_PROGRESS,
  );
  for (let i = 0; i < waitingOrInProgress.length; i++) {
    const c = waitingOrInProgress[i];
    const existing = await firestore.collection('queue').where('consultationId', '==', c.id).limit(1).get();
    if (!existing.empty) continue;

    const status = c.status === ConsultationStatus.IN_PROGRESS ? QueueStatus.IN_PROGRESS : QueueStatus.WAITING;
    const arrivalTime = new Date(Date.now() - i * 8 * 60 * 1000); // stagger arrival (older = waited longer)
    const urgencyLevel = (i % 5) + 1; // 1-5 for variety in waiting room
    const docRef = await firestore.collection('queue').add({
      consultationId: c.id,
      patientId: c.patientId,
      specialtyId: c.specialtyId,
      status,
      priority: urgencyLevel >= 4 ? QueuePriority.URGENT : urgencyLevel >= 3 ? QueuePriority.HIGH : QueuePriority.NORMAL,
      calculatedPriority: 0.3 + (urgencyLevel / 5) * 0.5,
      position: i + 1,
      estimatedWaitTime: new Date(arrivalTime.getTime() + (i + 1) * 20 * 60000),
      estimatedWaitMinutes: (i + 1) * 20,
      urgencyLevel,
      createdAt: arrivalTime,
      updatedAt: now(),
    });
    await docRef.update({ id: docRef.id });
  }
}

async function seedReferrals(
  patientIds: string[],
  hospitalIds: Record<string, string>,
  referredBy: string,
): Promise<void> {
  const fromId = hospitalIds['DLA'] || Object.values(hospitalIds)[0];
  const toId = hospitalIds['YDE'] || Object.values(hospitalIds)[1] || fromId;
  if (patientIds.length === 0 || fromId === toId) return;

  const existing = await firestore.collection('referrals').limit(1).get();
  if (!existing.empty) return;

  await firestore.collection('referrals').add({
    patientId: patientIds[0],
    fromHospitalId: fromId,
    toHospitalId: toId,
    referredBy,
    reason: 'Spécialiste requis',
    medicalSummary: 'Patient stable, besoin avis spécialisé',
    priority: ReferralPriority.MEDIUM,
    status: ReferralStatus.PENDING,
    createdAt: now(),
    updatedAt: now(),
  });
}

async function seedNotifications(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  const types: NotificationType[] = [NotificationType.APPOINTMENT, NotificationType.REMINDER, NotificationType.SYSTEM];
  for (const userId of userIds.slice(0, 3)) {
    await firestore.collection('notifications').add({
      userId,
      title: 'Rappel consultation',
      message: 'Vous avez une consultation programmée.',
      type: types[userIds.indexOf(userId) % types.length],
      isRead: false,
      createdAt: now(),
    });
  }
}

async function seedActivities(userIds: string[], hospitalId: string | null): Promise<void> {
  if (userIds.length === 0) return;
  const uid = userIds[0];
  await firestore.collection('activities').add({
    userId: uid,
    userRole: UserRole.DOCTOR,
    type: ActivityType.LOGIN,
    resource: ActivityResource.SYSTEM,
    description: 'Connexion au tableau de bord',
    hospitalId,
    timestamp: now(),
    createdAt: now(),
  });
}

async function seedPrescriptions(
  consultations: { id: string; patientId: string; doctorId: string; status: string }[],
): Promise<void> {
  const completed = consultations.filter((c) => c.status === ConsultationStatus.COMPLETED);
  if (completed.length === 0) return;
  const c = completed[0];
  const existing = await firestore.collection('prescriptions').where('consultationId', '==', c.id).limit(1).get();
  if (!existing.empty) return;

  await firestore.collection('prescriptions').add({
    consultationId: c.id,
    patientId: c.patientId,
    doctorId: c.doctorId,
    medications: [
      { name: 'Paracétamol 500mg', dosage: '1 comprimé', frequency: 'Toutes les 8h', duration: '5 jours' },
    ],
    isDispensed: false,
    createdAt: now(),
    updatedAt: now(),
  });
}

async function seedFollowups(
  consultations: { id: string; patientId: string; doctorId: string; status: string }[],
): Promise<void> {
  const completed = consultations.filter((c) => c.status === ConsultationStatus.COMPLETED);
  if (completed.length === 0) return;
  const c = completed[0];
  const existing = await firestore.collection('followups').where('consultationId', '==', c.id).limit(1).get();
  if (!existing.empty) return;

  const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await firestore.collection('followups').add({
    consultationId: c.id,
    patientId: c.patientId,
    doctorId: c.doctorId,
    scheduledAt,
    status: FollowupStatus.SCHEDULED,
    createdAt: now(),
    updatedAt: now(),
  });
}

async function run() {
  console.log('🌱 Seeding consistent data (patients, consultations, queue, referrals, etc.)...\n');

  const hospitalIds = await getHospitalIds();
  if (Object.keys(hospitalIds).length === 0) {
    console.log('  ⚠️  No hospitals found. Run seed:full first (seed:auth-roles creates hospitals).');
    await admin.app().delete();
    process.exit(1);
  }
  console.log('  ✅ Hospitals:', Object.keys(hospitalIds).join(', '));

  const specialtyIdMap = await getSpecialtyIds(firestore);
  console.log('  ✅ Specialties:', Object.keys(specialtyIdMap).length);

  const { doctors, nurse, primarySecretary, admin: adminUser } = await getUsersByRole();
  if (doctors.length === 0) {
    console.log('  ⚠️  No doctors found. Run seed:full first.');
    await admin.app().delete();
    process.exit(1);
  }
  console.log('  ✅ Users: doctors', doctors.length, ', nurse', nurse ? 1 : 0, ', secretary', primarySecretary ? 1 : 0);

  const patientIds = await seedPatients(hospitalIds);
  console.log('  ✅ Patients:', patientIds.length);

  const consultations = await seedConsultations(patientIds, doctors, specialtyIdMap);
  console.log('  ✅ Consultations:', consultations.length);

  await seedQueue(consultations);
  console.log('  ✅ Queue entries (for scheduled/in_progress consultations)');

  const referredBy = primarySecretary?.id ?? doctors[0].id;
  await seedReferrals(patientIds, hospitalIds, referredBy);
  console.log('  ✅ Referrals (1 sample)');

  const userIds = doctors.map((d) => d.id);
  if (nurse) userIds.push(nurse.id);
  if (adminUser) userIds.push(adminUser.id);
  await seedNotifications(userIds);
  console.log('  ✅ Notifications');

  await seedActivities(userIds, hospitalIds['YDE'] ?? null);
  console.log('  ✅ Activities');

  await seedPrescriptions(consultations);
  console.log('  ✅ Prescriptions (1 sample)');

  await seedFollowups(consultations);
  console.log('  ✅ Followups (1 sample)');

  console.log('\n🎉 Consistent seed data completed. Frontend, backend, and DB are aligned.\n');
  await admin.app().delete();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
