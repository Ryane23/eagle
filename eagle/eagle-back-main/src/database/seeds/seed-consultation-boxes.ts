import { config } from 'dotenv';
import { FirebaseService } from '../../config/firebase';
import { ConfigService } from '@nestjs/config';
import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';
import { ConsultationBoxStatus } from '../../modules/consultation-boxes/entities/consultation-box.entity';

config();

async function seed() {
  const firebase = new FirebaseService(new ConfigService(process.env));
  const hospitals = await firebase.collection('hospitals').get();
  for (const hospitalDoc of hospitals.docs) {
    const hospital = hospitalDoc.data();
    if (hospital.type !== HospitalType.SUB || hospital.isActive === false) continue;
    for (const code of ['A', 'B']) {
      const existing = await firebase
        .collection('consultation_boxes')
        .where('hospitalId', '==', hospitalDoc.id)
        .where('code', '==', code)
        .limit(1)
        .get();
      if (!existing.empty) continue;
      const now = new Date();
      await firebase.collection('consultation_boxes').add({
        hospitalId: hospitalDoc.id,
        code,
        name: `Box ${code}`,
        status: ConsultationBoxStatus.AVAILABLE,
        isActive: true,
        defaultSpecialtyId: null,
        currentSpecialtyId: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

seed()
  .then(() => console.log('Consultation boxes seeded'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
