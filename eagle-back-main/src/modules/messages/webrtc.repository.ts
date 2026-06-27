import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  WebRTCRoom,
  WebRTCRoomCollection,
  RoomStatus,
} from './entities/webrtc-room.entity';

@Injectable()
export class WebRTCRepository extends BaseRepository<WebRTCRoom> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, WebRTCRoomCollection);
  }

  /**
   * Find room by consultation ID
   */
  async findByConsultationId(
    consultationId: string,
  ): Promise<WebRTCRoom | null> {
    return this.findOne('consultationId', '==', consultationId);
  }

  /**
   * Find active rooms
   */
  async findActive(): Promise<WebRTCRoom[]> {
    return this.findWhere('status', '==', RoomStatus.ACTIVE);
  }

  /**
   * Find rooms by doctor ID
   */
  async findByDoctorId(doctorId: string): Promise<WebRTCRoom[]> {
    return this.findWhere('doctorId', '==', doctorId);
  }

  /**
   * Find rooms by patient ID
   */
  async findByPatientId(patientId: string): Promise<WebRTCRoom[]> {
    return this.findWhere('patientId', '==', patientId);
  }
}
