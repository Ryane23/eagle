import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FirebaseService } from '../../config/firebase';
import { Appointment, AppointmentCollection } from './entities/appointment.entity';

@Injectable()
export class AppointmentsRepository extends BaseRepository<Appointment> {
  constructor(firebase: FirebaseService) {
    super(firebase, AppointmentCollection);
  }
  findByHospital(hospitalId: string) {
    return this.findWhere('originHospitalId', '==', hospitalId);
  }
}
