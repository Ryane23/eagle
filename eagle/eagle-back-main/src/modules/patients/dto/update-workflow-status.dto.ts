import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateWorkflowStatusDto {
  @ApiProperty({
    description: 'Nurse workflow status',
    example: 'WAITING',
    enum: ['ARRIVED', 'WAITING', 'PREPARATION', 'READY', 'IN_CONSULTATION'],
  })
  @IsEnum(['ARRIVED', 'WAITING', 'PREPARATION', 'READY', 'IN_CONSULTATION'])
  status: 'ARRIVED' | 'WAITING' | 'PREPARATION' | 'READY' | 'IN_CONSULTATION';
}
