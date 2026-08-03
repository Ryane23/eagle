import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import {
  PermissionsRepository,
  RolePermissionsRepository,
} from './rbac.repository';

@Module({
  imports: [FirebaseModule],
  controllers: [RbacController],
  providers: [RbacService, PermissionsRepository, RolePermissionsRepository],
  exports: [RbacService],
})
export class RbacModule {}
