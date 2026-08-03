import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignDoctorDto {
  @ApiProperty({
    description: 'ID of the doctor to assign to the consultation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;
}
