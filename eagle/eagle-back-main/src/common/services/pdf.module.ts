import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { FirebaseModule } from '../../config/firebase';

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}

