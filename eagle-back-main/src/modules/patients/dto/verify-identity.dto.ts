import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class VerifyIdentityDto {
  @ApiProperty({
    description: 'Identity document type',
    example: 'CNI',
    enum: ['CNI', 'PASSPORT', 'OTHER'],
  })
  @IsEnum(['CNI', 'PASSPORT', 'OTHER'])
  identityDocumentType: string;

  @ApiProperty({
    description: 'URL to uploaded identity document',
    example: 'https://storage.googleapis.com/...',
    required: false,
  })
  @IsOptional()
  @IsString()
  identityDocumentUrl?: string;

  @ApiProperty({
    description: 'URL to patient photo',
    example: 'https://storage.googleapis.com/...',
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
