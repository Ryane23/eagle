import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

export enum SmsProvider {
  TWILIO = 'twilio',
  AFRICASTALKING = 'africastalking',
  // Add more providers as needed
}

export interface SmsOptions {
  to: string;
  message: string;
  from?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: SmsProvider;
  private readonly enabled: boolean;
  private twilioClient: twilio.Twilio | null = null;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<string>('SMS_ENABLED') === 'true';
    this.provider = (this.configService.get<string>('SMS_PROVIDER') ||
      SmsProvider.TWILIO) as SmsProvider;

    if (this.enabled && this.provider === SmsProvider.TWILIO) {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
      } else {
        this.logger.warn(
          'SMS enabled but Twilio credentials not configured. SMS will not be sent.',
        );
      }
    }
  }

  /**
   * Send SMS message
   */
  async sendSms(options: SmsOptions): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug('SMS is disabled. Message not sent.');
      return false;
    }

    try {
      switch (this.provider) {
        case SmsProvider.TWILIO:
          return await this.sendViaTwilio(options);
        case SmsProvider.AFRICASTALKING:
          return await this.sendViaAfricasTalking(options);
        default:
          this.logger.warn(`Unknown SMS provider: ${this.provider}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(options: SmsOptions): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.error('Twilio client not initialized');
      return false;
    }

    const fromNumber =
      options.from ||
      this.configService.get<string>('TWILIO_PHONE_NUMBER') ||
      '';

    if (!fromNumber) {
      this.logger.error('Twilio phone number not configured');
      return false;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: options.message,
        to: options.to,
        from: fromNumber,
      });

      this.logger.log(`SMS sent successfully. SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Twilio error: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send SMS via AfricasTalking
   */
  private async sendViaAfricasTalking(options: SmsOptions): Promise<boolean> {
    // TODO: Implement AfricasTalking integration
    this.logger.warn('AfricasTalking provider not yet implemented');
    return false;
  }

  /**
   * Send SMS with template
   */
  async sendTemplateSms(
    phoneNumber: string,
    template: string,
    data: Record<string, string>,
  ): Promise<boolean> {
    const message = this.replaceTemplate(template, data);
    return await this.sendSms({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Replace template placeholders with data
   */
  private replaceTemplate(
    template: string,
    data: Record<string, string>,
  ): string {
    let message = template;
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return message;
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(
    phoneNumbers: string[],
    message: string,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendSms({ to: phoneNumber, message });
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Common SMS templates
   */
  static readonly Templates = {
    CONSULTATION_CONFIRMED: 'Consultation confirmed {{time}}',
    ROOM_PRESENTATION: 'Room {{roomNumber}} presentation in {{minutes}} min',
    EXAM_REMINDER: 'Exams scheduled - Reminder tomorrow',
    FOLLOWUP_REMINDER: 'Follow-up appointment in {{days}} days',
    DAY1_REMINDER: 'Day+1 exam reminder SMS',
    DAY7_REMINDER: 'Day+7 control call reminder',
  };
}

