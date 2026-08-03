import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FirebaseService } from '../../config/firebase';
import { Urgency, UrgencyCollection, UrgencyStatus } from './entities/urgency.entity';

@Injectable()
export class UrgenciesRepository extends BaseRepository<Urgency> {
  constructor(firebase: FirebaseService) { super(firebase, UrgencyCollection); }
  findByHospital(hospitalId: string) { return this.findWhere('hospitalId', '==', hospitalId); }
  findByStatus(status: UrgencyStatus) { return this.findWhere('status', '==', status); }
}
