import { FirebaseService } from '../../config/firebase';
import { HospitalsService } from '../hospitals/hospitals.service';
import { User, UserRole } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService hospital hierarchy', () => {
  const user: User = {
    id: 'user-1',
    email: 'nurse@eagle.cm',
    password: 'hashed-password',
    name: 'Nurse Eagle',
    role: UserRole.NURSE,
    hospitalId: 'sub-1',
    specialtyId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findWhere: jest.fn(),
    update: jest.fn(),
  };
  const hospitalsService = {
    validateUserAssignment: jest.fn(),
  };
  const updateAuthUser = jest.fn();
  const firebaseService = {
    getAuth: () => ({ updateUser: updateAuthUser }),
  };
  const service = new UsersService(
    repository as unknown as UsersRepository,
    hospitalsService as unknown as HospitalsService,
    firebaseService as unknown as FirebaseService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('never returns password hashes from user listings', async () => {
    repository.findAll.mockResolvedValue([user]);

    const result = await service.findAll();

    expect(result).toEqual([
      expect.not.objectContaining({ password: expect.anything() }),
    ]);
  });

  it('validates role and hospital ownership before updating a user', async () => {
    repository.findById.mockResolvedValue(user);
    repository.update.mockResolvedValue({
      ...user,
      role: UserRole.SECONDARY_SECRETARY,
    });

    await service.update(user.id, {
      role: UserRole.SECONDARY_SECRETARY,
    });

    expect(hospitalsService.validateUserAssignment).toHaveBeenCalledWith(
      UserRole.SECONDARY_SECRETARY,
      user.hospitalId,
      null,
    );
  });

  it('synchronizes account activation with Firebase Auth', async () => {
    repository.findById.mockResolvedValue(user);
    repository.update.mockResolvedValue({ ...user, isActive: false });

    await service.deactivate(user.id);

    expect(updateAuthUser).toHaveBeenCalledWith(user.id, { disabled: true });
  });
});
