import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Patient, PatientCollection } from './entities/patient.entity';

@Injectable()
export class PatientsRepository extends BaseRepository<Patient> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, PatientCollection);
  }

  /**
   * Find patient by ID number (for uniqueness check)
   */
  async findByIdNumber(idNumber: string): Promise<Patient | null> {
    const querySnapshot = await this.collection
      .where('idNumber', '==', idNumber)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data() as Omit<Patient, 'id'>,
    };
  }

  /**
   * Find patients by hospital
   */
  async findByHospital(hospitalId: string): Promise<Patient[]> {
    const querySnapshot = await this.collection
      .where('hospitalId', '==', hospitalId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Patient, 'id'>,
    }));
  }

  /**
   * Find active patients by hospital
   */
  async findActiveByHospital(hospitalId: string): Promise<Patient[]> {
    const querySnapshot = await this.collection
      .where('hospitalId', '==', hospitalId)
      .where('isActive', '==', true)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Patient, 'id'>,
    }));
  }

  /**
   * Search patients by name or ID number
   * Firestore doesn't support full-text search, so we use prefix matching
   */
  async search(query: string, hospitalId?: string): Promise<Patient[]> {
    const searchLower = query.toLowerCase();
    const allPatients = hospitalId
      ? await this.findByHospital(hospitalId)
      : await this.findAll();

    return allPatients.filter(patient => {
      const firstName = patient.firstName?.toLowerCase() || '';
      const lastName = patient.lastName?.toLowerCase() || '';
      const idNumber = patient.idNumber?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.trim();

      return (
        firstName.startsWith(searchLower) ||
        lastName.startsWith(searchLower) ||
        fullName.includes(searchLower) ||
        idNumber.includes(searchLower)
      );
    });
  }
}

