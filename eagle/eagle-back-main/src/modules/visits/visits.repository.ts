import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FirebaseService } from '../../config/firebase';
import { Visit, VisitCollection, VisitStatus } from './entities/visit.entity';

@Injectable()
export class VisitsRepository extends BaseRepository<Visit> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, VisitCollection);
  }

  findByHospital(hospitalId: string) {
    return this.findWhere('originHospitalId', '==', hospitalId);
  }

  findByPatient(patientId: string) {
    return this.findWhere('patientId', '==', patientId);
  }

  findByHospitalAndStatus(hospitalId: string, status: VisitStatus) {
    return this.findByHospital(hospitalId).then((visits) =>
      visits.filter((visit) => visit.status === status),
    );
  }
}
