import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FirebaseModule } from '../../config/firebase';

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

