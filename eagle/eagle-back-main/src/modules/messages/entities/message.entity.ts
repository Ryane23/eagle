export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
}

export interface Message {
  id: string;
  consultationId?: string | null;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachmentUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export const MessageCollection = 'messages';
