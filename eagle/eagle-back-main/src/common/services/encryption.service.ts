import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be exactly 32 characters for AES-256',
      );
    }
    this.key = Buffer.from(encryptionKey, 'utf8');
  }

  /**
   * Encrypt sensitive health data using AES-256-CBC
   */
  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive health data using AES-256-CBC
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    // Records created before field encryption contain ordinary plaintext.
    // AES values always use a 16-byte hex IV followed by a non-empty hex body.
    if (!/^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(encryptedText)) {
      return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt multiple fields in an object
   */
  encryptFields<T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[],
  ): T {
    const encrypted = { ...data };
    fields.forEach((field) => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(String(encrypted[field])) as T[keyof T];
      }
    });
    return encrypted;
  }

  /**
   * Decrypt multiple fields in an object
   */
  decryptFields<T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[],
  ): T {
    const decrypted = { ...data };
    fields.forEach((field) => {
      if (decrypted[field]) {
        decrypted[field] = this.decrypt(String(decrypted[field])) as T[keyof T];
      }
    });
    return decrypted;
  }
}
