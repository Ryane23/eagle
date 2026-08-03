import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FirebaseService } from '../../config/firebase';
import { ConsultationBox, ConsultationBoxCollection } from './entities/consultation-box.entity';

@Injectable()
export class ConsultationBoxesRepository extends BaseRepository<ConsultationBox> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, ConsultationBoxCollection);
  }

  findByHospital(hospitalId: string) {
    return this.findWhere('hospitalId', '==', hospitalId);
  }
}
