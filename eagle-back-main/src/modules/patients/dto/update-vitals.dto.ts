import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNonEmptyObject', async: false })
export class IsNonEmptyObjectConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    return Object.keys(value).length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'vitalSigns must be a non-empty object';
  }
}

export class UpdateVitalsDto {
  @ApiProperty({
    description: 'Vital signs data object',
    example: {
      bloodPressure: '165/95',
      heartRate: 95,
      temperature: 37.2,
      oxygenSaturation: 98,
      weight: 78,
      respiratoryRate: 18,
    },
  })
  @IsObject({ message: 'vitalSigns must be an object' })
  @Validate(IsNonEmptyObjectConstraint)
  vitalSigns: Record<string, any>;
}
