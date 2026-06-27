import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Activity, ActivityCollection } from './entities/activity.entity';

@Injectable()
export class ActivitiesRepository extends BaseRepository<Activity> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, ActivityCollection);
  }

  async findByUser(userId: string, limit?: number): Promise<Activity[]> {
    let query = this.collection
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }

  async findByResource(
    resource: string,
    resourceId?: string,
    limit?: number,
  ): Promise<Activity[]> {
    let query = this.collection.where('resource', '==', resource);

    if (resourceId) {
      query = query.where('resourceId', '==', resourceId);
    }

    query = query.orderBy('timestamp', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }

  async findByType(type: string, limit?: number): Promise<Activity[]> {
    let query = this.collection
      .where('type', '==', type)
      .orderBy('timestamp', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
  ): Promise<Activity[]> {
    let query = this.collection
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }

  async findRecent(limit: number = 100): Promise<Activity[]> {
    const snapshot = await this.collection
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }

  async findByHospital(hospitalId: string, limit: number = 100): Promise<Activity[]> {
    const snapshot = await this.collection
      .where('hospitalId', '==', hospitalId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  }
}
