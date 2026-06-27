import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Referral, ReferralCollection, ReferralStatus } from './entities/referral.entity';

@Injectable()
export class ReferralsRepository extends BaseRepository<Referral> {
  constructor(protected readonly firebaseService: FirebaseService) {
    super(firebaseService, ReferralCollection);
  }

  async findByFromHospital(hospitalId: string): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('fromHospitalId', '==', hospitalId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }

  async findByToHospital(hospitalId: string): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('toHospitalId', '==', hospitalId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }

  async findByPatient(patientId: string): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }

  async findByStatus(status: ReferralStatus): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }

  async findByReferrer(userId: string): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('referredBy', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }

  async findPendingByHospital(hospitalId: string): Promise<Referral[]> {
    const snapshot = await this.firebaseService
      .collection(ReferralCollection)
      .where('toHospitalId', '==', hospitalId)
      .where('status', '==', ReferralStatus.PENDING)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Referral));
  }
}
