import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { HospitalScopeService } from '../hospitals/hospital-scope.service';
import { PatientsRepository } from '../patients/patients.repository';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateReferralDto } from './dto';
import {
  Referral,
  ReferralPriority,
  ReferralStatus,
} from './entities/referral.entity';
import { ReferralsRepository } from './referrals.repository';
import { ReferralsService } from './referrals.service';

describe('ReferralsService hospital boundaries', () => {
  const referralsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByPatient: jest.fn(),
    update: jest.fn(),
  };
  const patientsRepository = {
    findById: jest.fn(),
  };
  const hospitalScopeService = {
    assertReferralRoute: jest.fn(),
    assertAssignedToHospital: jest.fn(),
  };
  const service = new ReferralsService(
    referralsRepository as unknown as ReferralsRepository,
    patientsRepository as unknown as PatientsRepository,
    hospitalScopeService as unknown as HospitalScopeService,
  );
  const subUser: User = {
    id: 'doctor-sub',
    email: 'doctor@example.com',
    password: 'hashed',
    name: 'Sub Doctor',
    role: UserRole.DOCTOR,
    hospitalId: 'sub-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const createDto: CreateReferralDto = {
    patientId: 'patient-1',
    toHospitalId: 'primary-1',
    reason: 'Requires specialist assessment',
    medicalSummary:
      'Patient requires additional specialist care at the primary hospital.',
    priority: ReferralPriority.HIGH,
  };
  const referral: Referral = {
    id: 'referral-1',
    ...createDto,
    fromHospitalId: 'sub-1',
    referredBy: subUser.id,
    status: ReferralStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    patientsRepository.findById.mockResolvedValue({
      id: 'patient-1',
      hospitalId: 'sub-1',
    });
    referralsRepository.create.mockImplementation(async (data) => ({
      id: referral.id,
      ...data,
    }));
    referralsRepository.findById.mockResolvedValue(referral);
    referralsRepository.update.mockImplementation(async (_id, data) => ({
      ...referral,
      ...data,
    }));
  });

  it('verifies patient ownership and the parent referral route on creation', async () => {
    await service.create(createDto, subUser);

    expect(hospitalScopeService.assertReferralRoute).toHaveBeenCalledWith(
      subUser.hospitalId,
      createDto.toHospitalId,
    );
    expect(referralsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: createDto.patientId,
        fromHospitalId: subUser.hospitalId,
        referredBy: subUser.id,
      }),
    );
  });

  it('rejects creation when the patient belongs to another hospital', async () => {
    patientsRepository.findById.mockResolvedValue({
      id: 'patient-1',
      hospitalId: 'sub-2',
    });

    await expect(service.create(createDto, subUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects creation for an unknown patient', async () => {
    patientsRepository.findById.mockResolvedValue(null);

    await expect(service.create(createDto, subUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('requires acceptance to come from the receiving hospital', async () => {
    await service.accept(referral.id, {
      ...subUser,
      id: 'specialist-1',
      hospitalId: 'primary-1',
      specialtyId: 'cardiology',
    });

    expect(
      hospitalScopeService.assertAssignedToHospital,
    ).toHaveBeenCalledWith(expect.any(Object), referral.toHospitalId);
    expect(referralsRepository.update).toHaveBeenCalledWith(
      referral.id,
      expect.objectContaining({
        status: ReferralStatus.ACCEPTED,
        acceptedBy: 'specialist-1',
      }),
    );
  });

  it('hides a referral from users outside both participating hospitals', async () => {
    await expect(
      service.findById(referral.id, {
        ...subUser,
        hospitalId: 'sub-2',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
