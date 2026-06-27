import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class AcceptReferralDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  acceptanceNotes?: string;
}
