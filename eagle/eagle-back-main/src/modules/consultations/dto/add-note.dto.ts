import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddNoteDto {
  @ApiProperty({
    description: 'Consultation note content',
    example: 'Patient reports chest pain for 2 days. Recommended ECG and blood tests.',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  note: string;
}
