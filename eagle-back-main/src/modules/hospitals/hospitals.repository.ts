import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Hospital, HospitalCollection, HospitalType } from './entities/hospital.entity';

@Injectable()
export class HospitalsRepository extends BaseRepository<Hospital> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, HospitalCollection);
  }

  /**
   * Find hospitals by type (PRIMARY or SECONDARY)
   */
  async findByType(type: HospitalType): Promise<Hospital[]> {
    const querySnapshot = await this.collection
      .where('type', '==', type)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Hospital, 'id'>,
    }));
  }

  /**
   * Find the primary center (should only be one)
   */
  async findPrimaryCenter(): Promise<Hospital | null> {
    const querySnapshot = await this.collection
      .where('type', '==', HospitalType.PRIMARY)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data() as Omit<Hospital, 'id'>,
    };
  }

  /**
   * Count primary centers (for validation)
   */
  async countPrimaryCenters(): Promise<number> {
    const querySnapshot = await this.collection
      .where('type', '==', HospitalType.PRIMARY)
      .count()
      .get();

    return querySnapshot.data().count;
  }

  /**
   * Find all active hospitals
   */
  async findActive(): Promise<Hospital[]> {
    const querySnapshot = await this.collection
      .where('isActive', '==', true)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Hospital, 'id'>,
    }));
  }
}
