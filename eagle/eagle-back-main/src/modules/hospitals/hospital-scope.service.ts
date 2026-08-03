import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { Hospital, HospitalType } from './entities/hospital.entity';
import { HospitalsRepository } from './hospitals.repository';

@Injectable()
export class HospitalScopeService {
  constructor(private readonly hospitalsRepository: HospitalsRepository) {}

  async getRequiredHospital(hospitalId: string): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }
    return hospital;
  }

  async getScopeHospitalIds(hospitalId: string): Promise<string[]> {
    const hospital = await this.getRequiredHospital(hospitalId);
    if (hospital.type === HospitalType.SUB) {
      return [hospital.id];
    }

    const children = await this.hospitalsRepository.findChildren(hospital.id);
    return [hospital.id, ...children.map((child) => child.id)];
  }

  async assertCanAccessHospital(
    user: User,
    targetHospitalId: string,
  ): Promise<void> {
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (!user.hospitalId) {
      throw new ForbiddenException('User is not assigned to a hospital');
    }

    const scopeHospitalIds = await this.getScopeHospitalIds(user.hospitalId);
    if (!scopeHospitalIds.includes(targetHospitalId)) {
      throw new ForbiddenException(
        'This hospital is outside your assigned hospital scope',
      );
    }
  }

  assertAssignedToHospital(user: User, hospitalId: string): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (!user.hospitalId || user.hospitalId !== hospitalId) {
      throw new ForbiddenException(
        'This action must be performed by the assigned hospital',
      );
    }
  }

  async assertReferralRoute(
    fromHospitalId: string,
    toHospitalId: string,
  ): Promise<void> {
    const [fromHospital, toHospital] = await Promise.all([
      this.getRequiredHospital(fromHospitalId),
      this.getRequiredHospital(toHospitalId),
    ]);

    if (!fromHospital.isActive || !toHospital.isActive) {
      throw new BadRequestException(
        'Referrals require active sending and receiving hospitals',
      );
    }
    if (fromHospital.type !== HospitalType.SUB) {
      throw new BadRequestException(
        'Referrals must originate from a SUB hospital',
      );
    }
    if (
      toHospital.type !== HospitalType.PRIMARY ||
      fromHospital.parentHospitalId !== toHospital.id
    ) {
      throw new BadRequestException(
        'A SUB hospital can only refer patients to its parent PRIMARY hospital',
      );
    }
  }
}
