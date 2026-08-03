import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { HospitalsService } from '../hospitals/hospitals.service';
import { UpdateUserDto } from './dto';
import { User, UserRole } from './entities/user.entity';
import { UsersRepository } from './users.repository';

export type SafeUser = Omit<User, 'password'>;

export type UserFilters = {
  role?: UserRole;
  hospitalId?: string;
  isActive?: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hospitalsService: HospitalsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findAll(filters: UserFilters = {}): Promise<SafeUser[]> {
    const users = await this.usersRepository.findAll();

    return users
      .filter((user) => !filters.role || user.role === filters.role)
      .filter(
        (user) => !filters.hospitalId || user.hospitalId === filters.hospitalId,
      )
      .filter(
        (user) =>
          filters.isActive === undefined || user.isActive === filters.isActive,
      )
      .map((user) => this.withoutPassword(user));
  }

  async findCareTeam(user: User): Promise<SafeUser[]> {
    if (!user.hospitalId) return [];
    const hospital = await this.hospitalsService.findById(user.hospitalId);
    const allowedHospitalIds = [
      hospital.id,
      ...(hospital.parentHospitalId ? [hospital.parentHospitalId] : []),
    ];
    const users = await this.usersRepository.findAll();
    return users
      .filter(
        (candidate) =>
          candidate.isActive &&
          (candidate.role === UserRole.ADMIN ||
            (!!candidate.hospitalId &&
              allowedHospitalIds.includes(candidate.hospitalId))) &&
          [
            UserRole.NURSE,
            UserRole.DOCTOR,
            UserRole.SECONDARY_SECRETARY,
            UserRole.PRIMARY_SECRETARY,
            UserRole.ADMIN,
          ].includes(candidate.role),
      )
      .map(({ password, ...safe }) => safe);
  }

  async findDoctors(): Promise<SafeUser[]> {
    const users = await this.usersRepository.findWhere(
      'role',
      '==',
      UserRole.DOCTOR,
    );
    return users
      .filter((user) => user.isActive)
      .map((user) => this.withoutPassword(user));
  }

  async findById(id: string): Promise<SafeUser> {
    return this.withoutPassword(await this.findEntity(id));
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.findEntity(id);
    const role = updateDto.role ?? user.role;
    const hospitalId =
      updateDto.hospitalId !== undefined
        ? updateDto.hospitalId
        : user.hospitalId;
    const specialtyId =
      updateDto.specialtyId !== undefined
        ? updateDto.specialtyId
        : user.specialtyId;

    await this.hospitalsService.validateUserAssignment(
      role,
      hospitalId,
      specialtyId,
    );

    if (updateDto.email && updateDto.email !== user.email) {
      const existing = await this.usersRepository.findOne(
        'email',
        '==',
        updateDto.email,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
      await this.firebaseService.getAuth().updateUser(id, {
        email: updateDto.email,
      });
    }

    if (updateDto.isActive !== undefined) {
      await this.firebaseService.getAuth().updateUser(id, {
        disabled: !updateDto.isActive,
      });
    }

    const updated = await this.usersRepository.update(id, {
      ...updateDto,
      hospitalId,
      specialtyId,
      updatedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.withoutPassword(updated);
  }

  async activate(id: string): Promise<SafeUser> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<SafeUser> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<void> {
    await this.deactivate(id);
  }

  private async findEntity(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  private withoutPassword(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
