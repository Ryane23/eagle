import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Specialty, SpecialtyCollection } from './entities/specialty.entity';

@Injectable()
export class SpecialtiesRepository extends BaseRepository<Specialty> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, SpecialtyCollection);
  }

  /**
   * Find active specialties
   */
  async findActive(): Promise<Specialty[]> {
    const querySnapshot = await this.collection
      .where('isActive', '==', true)
      .orderBy('displayOrder', 'asc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Specialty, 'id'>,
    }));
  }

  /**
   * Find specialties by name (search)
   */
  async searchByName(query: string): Promise<Specialty[]> {
    const querySnapshot = await this.collection
      .where('isActive', '==', true)
      .get();

    const allSpecialties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Specialty, 'id'>,
    }));

    // Filter by name (case-insensitive)
    const lowerQuery = query.toLowerCase();
    return allSpecialties.filter(specialty =>
      specialty.name.toLowerCase().includes(lowerQuery),
    );
  }
}
