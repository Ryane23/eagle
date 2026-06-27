import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  Followup,
  FollowupCollection,
  FollowupStatus,
} from './entities/followup.entity';

@Injectable()
export class FollowupsRepository extends BaseRepository<Followup> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, FollowupCollection);
  }

  /**
   * Find follow-ups by patient ID
   */
  async findByPatientId(patientId: string): Promise<Followup[]> {
    const querySnapshot = await this.collection
      .where('patientId', '==', patientId)
      .orderBy('scheduledAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Followup, 'id'>,
    }));
  }

  /**
   * Find follow-ups by doctor ID
   */
  async findByDoctorId(doctorId: string): Promise<Followup[]> {
    const querySnapshot = await this.collection
      .where('doctorId', '==', doctorId)
      .orderBy('scheduledAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Followup, 'id'>,
    }));
  }

  /**
   * Find follow-ups by consultation ID
   */
  async findByConsultationId(consultationId: string): Promise<Followup[]> {
    const querySnapshot = await this.collection
      .where('consultationId', '==', consultationId)
      .orderBy('scheduledAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Followup, 'id'>,
    }));
  }

  /**
   * Find upcoming follow-ups
   */
  async findUpcoming(limit: number = 50): Promise<Followup[]> {
    const now = new Date();
    const querySnapshot = await this.collection
      .where('status', '==', FollowupStatus.SCHEDULED)
      .where('scheduledAt', '>=', now)
      .orderBy('scheduledAt', 'asc')
      .limit(limit)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Followup, 'id'>,
    }));
  }

  /**
   * Find follow-ups by status
   */
  async findByStatus(status: FollowupStatus): Promise<Followup[]> {
    const querySnapshot = await this.collection
      .where('status', '==', status)
      .orderBy('scheduledAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Followup, 'id'>,
    }));
  }
}

