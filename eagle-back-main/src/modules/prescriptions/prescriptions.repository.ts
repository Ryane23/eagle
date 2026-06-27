import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  Prescription,
  PrescriptionCollection,
} from './entities/prescription.entity';

@Injectable()
export class PrescriptionsRepository extends BaseRepository<Prescription> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, PrescriptionCollection);
  }

  /**
   * Find prescriptions by consultation ID
   */
  async findByConsultationId(
    consultationId: string,
  ): Promise<Prescription[]> {
    return this.findWhere('consultationId', '==', consultationId);
  }

  /**
   * Find prescriptions by patient ID
   */
  async findByPatientId(patientId: string): Promise<Prescription[]> {
    return this.findWhere('patientId', '==', patientId);
  }

  /**
   * Find prescriptions by doctor ID
   */
  async findByDoctorId(doctorId: string): Promise<Prescription[]> {
    return this.findWhere('doctorId', '==', doctorId);
  }

  /**
   * Find prescriptions by hospital (through patient's hospital)
   * Note: This requires joining with patients collection, handled in service
   */
  async findDispensed(dispensed: boolean): Promise<Prescription[]> {
    return this.findWhere('isDispensed', '==', dispensed);
  }
}
