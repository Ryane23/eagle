import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { Hospital, HospitalType } from './entities/hospital.entity';
import { HospitalScopeService } from './hospital-scope.service';
import { HospitalsRepository } from './hospitals.repository';

describe('HospitalScopeService', () => {
  const repository = {
    findById: jest.fn(),
    findChildren: jest.fn(),
  };
  const service = new HospitalScopeService(
    repository as unknown as HospitalsRepository,
  );
  const primary: Hospital = {
    id: 'primary-1',
    name: 'Primary Hospital',
    type: HospitalType.PRIMARY,
    parentHospitalId: null,
    address: 'Primary Road',
    city: 'Yaounde',
    country: 'Cameroon',
    contactPhone: '+237600000001',
    contactEmail: 'primary@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const subHospital: Hospital = {
    ...primary,
    id: 'sub-1',
    name: 'Sub Hospital',
    type: HospitalType.SUB,
    parentHospitalId: primary.id,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    repository.findById.mockImplementation(async (id: string) => {
      if (id === primary.id) return primary;
      if (id === subHospital.id) return subHospital;
      return null;
    });
    repository.findChildren.mockResolvedValue([subHospital]);
  });

  it('allows a SUB hospital to refer to its parent PRIMARY hospital', async () => {
    await expect(
      service.assertReferralRoute(subHospital.id, primary.id),
    ).resolves.toBeUndefined();
  });

  it('rejects referrals originating from a PRIMARY hospital', async () => {
    await expect(
      service.assertReferralRoute(primary.id, subHospital.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('gives a PRIMARY hospital access to its child hospitals', async () => {
    await expect(
      service.assertCanAccessHospital(
        {
          id: 'secretary-1',
          email: 'secretary@example.com',
          password: 'hashed',
          name: 'Primary Secretary',
          role: UserRole.PRIMARY_SECRETARY,
          hospitalId: primary.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        subHospital.id,
      ),
    ).resolves.toBeUndefined();
  });

  it('prevents a SUB hospital user from acting for its PRIMARY hospital', () => {
    expect(() =>
      service.assertAssignedToHospital(
        {
          id: 'nurse-1',
          email: 'nurse@example.com',
          password: 'hashed',
          name: 'Sub Nurse',
          role: UserRole.NURSE,
          hospitalId: subHospital.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        primary.id,
      ),
    ).toThrow(ForbiddenException);
  });
});
