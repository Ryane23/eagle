import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { UsersRepository } from './users.repository';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [FirebaseModule, HospitalsModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
