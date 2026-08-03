import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  Complaint,
  ComplaintCollection,
  ComplaintStatus,
  ComplaintType,
  ComplaintPriority,
} from './entities/complaint.entity';

@Injectable()
export class ComplaintsRepository extends BaseRepository<Complaint> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, ComplaintCollection);
  }

  /**
   * Find complaints by status
   */
  async findByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    const querySnapshot = await this.collection
      .where('status', '==', status)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Complaint, 'id'>,
    }));
  }

  /**
   * Find complaints by type
   */
  async findByType(type: ComplaintType): Promise<Complaint[]> {
    const querySnapshot = await this.collection
      .where('type', '==', type)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Complaint, 'id'>,
    }));
  }

  /**
   * Find complaints by priority
   */
  async findByPriority(priority: ComplaintPriority): Promise<Complaint[]> {
    const querySnapshot = await this.collection
      .where('priority', '==', priority)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Complaint, 'id'>,
    }));
  }

  /**
   * Find complaints by complainant
   */
  async findByComplainant(userId: string): Promise<Complaint[]> {
    const querySnapshot = await this.collection
      .where('complainedBy', '==', userId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Complaint, 'id'>,
    }));
  }

  /**
   * Find complaints by hospital
   */
  async findByHospital(hospitalId: string): Promise<Complaint[]> {
    const querySnapshot = await this.collection
      .where('relatedHospitalId', '==', hospitalId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Complaint, 'id'>,
    }));
  }
}

