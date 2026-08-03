export interface AuthToken {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const AuthTokenCollection = 'auth_tokens';
