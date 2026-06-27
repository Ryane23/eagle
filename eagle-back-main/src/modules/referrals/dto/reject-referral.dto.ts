import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RejectReferralDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  rejectionReason: string;
}
