import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  Consultation,
  ConsultationCollection,
  ConsultationStatus,
  ConsultationType,
} from './entities/consultation.entity';

@Injectable()
export class ConsultationsRepository extends BaseRepository<Consultation> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, ConsultationCollection);
  }

  /**
   * Find consultations by doctor ID
   */
  async findByDoctorId(doctorId: string): Promise<Consultation[]> {
    const querySnapshot = await this.collection
      .where('doctorId', '==', doctorId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Consultation, 'id'>,
    }));
  }

  /**
   * Find consultations by patient ID
   */
  async findByPatientId(patientId: string): Promise<Consultation[]> {
    const querySnapshot = await this.collection
      .where('patientId', '==', patientId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Consultation, 'id'>,
    }));
  }

  /**
   * Find consultations by status
   */
  async findByStatus(status: ConsultationStatus): Promise<Consultation[]> {
    const querySnapshot = await this.collection
      .where('status', '==', status)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Consultation, 'id'>,
    }));
  }

  /**
   * Find consultations by doctor and status
   */
  async findByDoctorAndStatus(
    doctorId: string,
    statuses: ConsultationStatus[],
  ): Promise<Consultation[]> {
    if (statuses.length === 0) return [];
    if (statuses.length === 1) {
      const querySnapshot = await this.collection
        .where('doctorId', '==', doctorId)
        .where('status', '==', statuses[0])
        .get();

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Consultation, 'id'>,
      }));
    }

    const querySnapshot = await this.collection
      .where('doctorId', '==', doctorId)
      .where('status', 'in', statuses)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Consultation, 'id'>,
    }));
  }

  /**
   * Find video consultations by status (for nurse teleconsultation)
   */
  async findByTypeAndStatuses(
    type: ConsultationType,
    statuses: ConsultationStatus[],
  ): Promise<Consultation[]> {
    if (statuses.length === 0) return [];
    const querySnapshot = await this.collection
      .where('type', '==', type)
      .where('status', 'in', statuses)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Consultation, 'id'>,
    }));
  }
}

