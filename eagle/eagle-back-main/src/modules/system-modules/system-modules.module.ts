import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { SystemModulesController } from './system-modules.controller';
import { SystemModulesService } from './system-modules.service';

@Module({
  imports: [FirebaseModule],
  controllers: [SystemModulesController],
  providers: [SystemModulesService],
  exports: [SystemModulesService],
})
export class SystemModulesModule {}
