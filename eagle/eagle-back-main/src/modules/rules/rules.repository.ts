import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Rule, RuleCollection } from './entities/rule.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RulesRepository extends BaseRepository<Rule> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, RuleCollection);
  }

  /**
   * Find rules by role
   */
  async findByRole(role: UserRole): Promise<Rule[]> {
    const querySnapshot = await this.collection
      .where('role', '==', role)
      .where('isActive', '==', true)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Rule, 'id'>,
    }));
  }

  /**
   * Find all active rules
   */
  async findActive(): Promise<Rule[]> {
    const querySnapshot = await this.collection
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Rule, 'id'>,
    }));
  }
}
