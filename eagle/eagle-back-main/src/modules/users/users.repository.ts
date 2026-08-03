import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import { User, UserCollection, UserRole } from './entities/user.entity';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, UserCollection);
  }

  async findByRoleAndHospital(
    role: UserRole,
    hospitalId: string,
  ): Promise<User[]> {
    return this.findWhere('role', '==', role).then(users =>
      users.filter(user => user.hospitalId === hospitalId),
    );
  }
}
