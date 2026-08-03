import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FirebaseService } from '../../config/firebase';
import { Ticket, TicketCollection } from './entities/ticket.entity';
@Injectable()
export class TicketsRepository extends BaseRepository<Ticket> {
  constructor(firebase: FirebaseService) { super(firebase, TicketCollection); }
  byVisit(id: string) { return this.findOne('visitId', '==', id); }
  byPatient(id: string) { return this.findWhere('patientId', '==', id); }
  byHospital(id: string) { return this.findWhere('originHospitalId', '==', id); }
  byNumber(number: string) { return this.findOne('ticketNumber', '==', number); }
}
