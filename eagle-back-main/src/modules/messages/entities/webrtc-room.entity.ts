export enum RoomStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  ENDED = 'ended',
}

export interface WebRTCRoom {
  id: string;
  consultationId: string; // Required - Links to consultation
  
  // Participants
  doctorId: string;
  patientId: string;
  
  // Room state
  status: RoomStatus;
  
  // Connection tracking
  doctorConnected: boolean;
  patientConnected: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
}

export const WebRTCRoomCollection = 'webrtc_rooms';
