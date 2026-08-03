import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CalendarEvent, CalendarEventCollection, EventType } from './entities/calendar-event.entity';

@Injectable()
export class CalendarRepository extends BaseRepository<CalendarEvent> {
  constructor(protected readonly firebaseService: FirebaseService) {
    super(firebaseService, CalendarEventCollection);
  }

  async findActive(): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('isActive', '==', true)
      .where('isCancelled', '==', false)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByOrganizer(organizerId: string): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('organizerId', '==', organizerId)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByParticipant(userId: string): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('participantIds', 'array-contains', userId)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('startDate', '>=', startDate)
      .where('startDate', '<=', endDate)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByType(type: EventType): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('type', '==', type)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByHospital(hospitalId: string): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('hospitalId', '==', hospitalId)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }

  async findByResource(resourceType: string, resourceId: string): Promise<CalendarEvent[]> {
    const snapshot = await this.firebaseService
      .collection(CalendarEventCollection)
      .where('resourceType', '==', resourceType)
      .where('resourceId', '==', resourceId)
      .where('isActive', '==', true)
      .orderBy('startDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  }
}
