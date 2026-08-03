import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  Max,
  Min,
} from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxUrgencyLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  defaultConsultationDuration?: number;

  @IsOptional()
  @IsBoolean()
  autoDistribution?: boolean;

  @IsOptional()
  @IsBoolean()
  loadBalancing?: boolean;

  @IsOptional()
  @IsIn(['availability', 'workload', 'specialty', 'manual'])
  assignmentStrategy?: 'availability' | 'workload' | 'specialty' | 'manual';

  @IsOptional()
  @IsArray()
  urgencyLevels?: Array<{
    level: number;
    maxWaitMinutes: number;
    immediateNotification: boolean;
    overdueAction: 'alert' | 'escalate' | 'reassign';
  }>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  minBandwidthMbps?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  consultationStartDelayMinutes?: number;

  @IsOptional()
  @IsBoolean()
  autoRecordConsultations?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSize?: number;
}
