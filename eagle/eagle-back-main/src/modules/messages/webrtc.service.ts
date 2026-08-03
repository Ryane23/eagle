import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { WebRTCRepository } from './webrtc.repository';
import {
  WebRTCRoom,
  RoomStatus,
} from './entities/webrtc-room.entity';
import { FirebaseService } from '../../config/firebase';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';
import { ConsultationStatus } from '../consultations/entities/consultation.entity';
import { UserCollection } from '../users/entities/user.entity';

@Injectable()
export class WebRTCService {
  constructor(
    private readonly webrtcRepository: WebRTCRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Create WebRTC room for consultation
   */
  async createRoom(consultationId: string): Promise<WebRTCRoom> {
    // Check if room already exists
    const existingRoom = await this.webrtcRepository.findByConsultationId(
      consultationId,
    );

    if (existingRoom && existingRoom.status === RoomStatus.ACTIVE) {
      return existingRoom;
    }

    // Get consultation details
    const consultationDoc = await this.firebaseService
      .collection(ConsultationCollection)
      .doc(consultationId)
      .get();

    if (!consultationDoc.exists) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    const consultationData = consultationDoc.data();
    if (!consultationData?.doctorId || !consultationData?.patientId) {
      throw new BadRequestException(
        'Consultation must have both doctor and patient assigned',
      );
    }

    // Verify consultation is in progress
    if (consultationData.status !== ConsultationStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot create room for consultation with status ${consultationData.status}. Consultation must be IN_PROGRESS`,
      );
    }

    // Create or update room
    if (existingRoom) {
      const updated = await this.webrtcRepository.update(existingRoom.id, {
        status: RoomStatus.ACTIVE,
        doctorConnected: false,
        patientConnected: false,
        startedAt: new Date(),
        endedAt: null,
        updatedAt: new Date(),
      });
      return updated!;
    }

    const roomData: Partial<WebRTCRoom> = {
      consultationId,
      doctorId: consultationData.doctorId,
      patientId: consultationData.patientId,
      status: RoomStatus.ACTIVE,
      doctorConnected: false,
      patientConnected: false,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.webrtcRepository.create(roomData);
  }

  /**
   * Get room by consultation ID
   */
  async getRoomByConsultationId(
    consultationId: string,
  ): Promise<WebRTCRoom | null> {
    return await this.webrtcRepository.findByConsultationId(consultationId);
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: string): Promise<WebRTCRoom> {
    const room = await this.webrtcRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    return room;
  }

  /**
   * Verify user can access room
   * Allows: doctor, patient, or any nurse (nurse assists patient at consultation)
   */
  async verifyRoomAccess(
    roomId: string,
    userId: string,
  ): Promise<WebRTCRoom> {
    const room = await this.getRoomById(roomId);

    if (room.doctorId === userId || room.patientId === userId) {
      return room;
    }

    // Allow any nurse to join (nurse assists patient during teleconsultation)
    const userDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(userId)
      .get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (userData?.role === 'nurse') {
      return room;
    }

    throw new ForbiddenException(
      'You do not have permission to access this room',
    );
  }

  /**
   * Mark user as connected
   * Doctor -> doctorConnected; Patient or Nurse (patient side) -> patientConnected
   */
  async markUserConnected(
    roomId: string,
    userId: string,
  ): Promise<WebRTCRoom> {
    const room = await this.verifyRoomAccess(roomId, userId);

    const updateData: Partial<WebRTCRoom> = {
      updatedAt: new Date(),
    };

    if (room.doctorId === userId) {
      updateData.doctorConnected = true;
    } else {
      // Patient or nurse (assisting patient at secondary center)
      updateData.patientConnected = true;
    }

    const updated = await this.webrtcRepository.update(roomId, updateData);
    return updated!;
  }

  /**
   * Mark user as disconnected
   */
  async markUserDisconnected(
    roomId: string,
    userId: string,
  ): Promise<WebRTCRoom> {
    const room = await this.verifyRoomAccess(roomId, userId);

    const updateData: Partial<WebRTCRoom> = {
      updatedAt: new Date(),
    };

    if (room.doctorId === userId) {
      updateData.doctorConnected = false;
    } else {
      updateData.patientConnected = false;
    }

    const updated = await this.webrtcRepository.update(roomId, updateData);
    return updated!;
  }

  /**
   * End room (when consultation ends)
   */
  async endRoom(roomId: string): Promise<WebRTCRoom> {
    const room = await this.getRoomById(roomId);

    const updated = await this.webrtcRepository.update(roomId, {
      status: RoomStatus.ENDED,
      doctorConnected: false,
      patientConnected: false,
      endedAt: new Date(),
      updatedAt: new Date(),
    });

    return updated!;
  }

  /**
   * End room by consultation ID
   */
  async endRoomByConsultationId(consultationId: string): Promise<void> {
    const room = await this.webrtcRepository.findByConsultationId(
      consultationId,
    );

    if (room && room.status === RoomStatus.ACTIVE) {
      await this.endRoom(room.id);
    }
  }
}
