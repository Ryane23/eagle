import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateHospitalDto, UpdateHospitalDto } from './dto';
import { Hospital, HospitalType } from './entities/hospital.entity';
import { HospitalsRepository } from './hospitals.repository';
import { HospitalsService } from './hospitals.service';
import { UserRole } from '../users/entities/user.entity';

describe('HospitalsService hierarchy rules', () => {
  const repository = {
    create: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findChildren: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };
  const service = new HospitalsService(
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
  const baseCreateDto: Omit<CreateHospitalDto, 'type'> = {
    name: 'New Hospital',
    address: 'Hospital Road',
    city: 'Douala',
    country: 'Cameroon',
    contactPhone: '+237600000002',
    contactEmail: 'hospital@example.com',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('stores PRIMARY hospitals with a null parent', async () => {
    repository.create.mockImplementation(async (data) => ({
      id: 'primary-2',
      ...data,
    }));

    await service.create({
      ...baseCreateDto,
      type: HospitalType.PRIMARY,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HospitalType.PRIMARY,
        parentHospitalId: null,
      }),
    );
  });

  it('builds the database hospital hierarchy as sorted PRIMARY roots', async () => {
    const secondPrimary = {
      ...primary,
      id: 'primary-2',
      name: 'Alpha Primary',
    };
    const secondChild = {
      ...subHospital,
      id: 'sub-2',
      name: 'Alpha Sub',
    };
    repository.findAll.mockResolvedValue([
      primary,
      subHospital,
      secondChild,
      secondPrimary,
    ]);

    const tree = await service.findTree();

    expect(tree.map((hospital) => hospital.id)).toEqual([
      secondPrimary.id,
      primary.id,
    ]);
    expect(tree[1].children.map((hospital) => hospital.id)).toEqual([
      secondChild.id,
      subHospital.id,
    ]);
  });

  it('rejects disconnected hospitals while building the tree', async () => {
    repository.findAll.mockResolvedValue([
      primary,
      {
        ...subHospital,
        parentHospitalId: 'missing-primary',
      },
    ]);

    await expect(service.findTree()).rejects.toBeInstanceOf(ConflictException);
  });

  it('accepts specialist doctors assigned to a PRIMARY hospital', async () => {
    repository.findById.mockResolvedValue(primary);

    await expect(
      service.validateUserAssignment(UserRole.DOCTOR, primary.id, 'cardiology'),
    ).resolves.toBeUndefined();
  });

  it('rejects specialist doctors assigned to a SUB hospital', async () => {
    repository.findById.mockResolvedValue(subHospital);

    await expect(
      service.validateUserAssignment(
        UserRole.DOCTOR,
        subHospital.id,
        'cardiology',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects nurses without a hospital assignment', async () => {
    await expect(
      service.validateUserAssignment(UserRole.NURSE),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a PRIMARY hospital with a parent', async () => {
    await expect(
      service.create({
        ...baseCreateDto,
        type: HospitalType.PRIMARY,
        parentHospitalId: primary.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a SUB hospital under an active root PRIMARY', async () => {
    repository.findById.mockResolvedValue(primary);
    repository.create.mockImplementation(async (data) => ({
      id: 'sub-2',
      ...data,
    }));

    await service.create({
      ...baseCreateDto,
      type: HospitalType.SUB,
      parentHospitalId: primary.id,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HospitalType.SUB,
        parentHospitalId: primary.id,
      }),
    );
  });

  it('rejects an orphan SUB hospital', async () => {
    await expect(
      service.create({
        ...baseCreateDto,
        type: HospitalType.SUB,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a SUB hospital as a parent', async () => {
    repository.findById.mockResolvedValue(subHospital);

    await expect(
      service.create({
        ...baseCreateDto,
        type: HospitalType.SUB,
        parentHospitalId: subHospital.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an inactive PRIMARY as a parent', async () => {
    repository.findById.mockResolvedValue({ ...primary, isActive: false });

    await expect(
      service.create({
        ...baseCreateDto,
        type: HospitalType.SUB,
        parentHospitalId: primary.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects self-parenting during update', async () => {
    repository.findById.mockResolvedValue(subHospital);
    repository.findChildren.mockResolvedValue([]);

    await expect(
      service.update(subHospital.id, {
        parentHospitalId: subHospital.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects changing a hospital with children to SUB', async () => {
    repository.findById.mockResolvedValue(primary);
    repository.findChildren.mockResolvedValue([subHospital]);

    await expect(
      service.update(primary.id, {
        type: HospitalType.SUB,
        parentHospitalId: 'primary-2',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('clears the parent when changing a SUB hospital to PRIMARY', async () => {
    repository.findById.mockResolvedValue(subHospital);
    repository.update.mockImplementation(async (_id, data) => ({
      ...subHospital,
      ...data,
    }));

    const result = await service.update(subHospital.id, {
      type: HospitalType.PRIMARY,
    });

    expect(repository.update).toHaveBeenCalledWith(
      subHospital.id,
      expect.objectContaining({
        type: HospitalType.PRIMARY,
        parentHospitalId: null,
      }),
    );
    expect(result.parentHospitalId).toBeNull();
  });

  it('preserves the parent for a transformed name-only update DTO', async () => {
    repository.findById
      .mockResolvedValueOnce(subHospital)
      .mockResolvedValueOnce(primary);
    repository.findChildren.mockResolvedValue([]);
    repository.update.mockImplementation(async (_id, data) => ({
      ...subHospital,
      ...data,
    }));
    const updateDto = new UpdateHospitalDto();
    updateDto.name = 'Renamed Sub Hospital';

    const result = await service.update(subHospital.id, updateDto);

    expect(repository.update).toHaveBeenCalledWith(
      subHospital.id,
      expect.objectContaining({
        name: 'Renamed Sub Hospital',
        parentHospitalId: primary.id,
      }),
    );
    expect(result.parentHospitalId).toBe(primary.id);
  });

  it('does not delete a hospital that still has children', async () => {
    repository.findById.mockResolvedValue(primary);
    repository.findChildren.mockResolvedValue([subHospital]);

    await expect(service.delete(primary.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
