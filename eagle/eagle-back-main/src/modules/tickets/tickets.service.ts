import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FirebaseService } from '../../config/firebase';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import type { Visit } from '../visits/entities/visit.entity';
import { VisitsRepository } from '../visits/visits.repository';
import { TicketCollection } from './entities/ticket.entity';
import { TicketsRepository } from './tickets.repository';

@Injectable()
export class TicketsService {
  constructor(
    private readonly repository: TicketsRepository,
    private readonly visits: VisitsRepository,
    private readonly firebase: FirebaseService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent('visit.ready-for-scheduling')
  async createForReadyVisit(visit: Visit) {
    return this.createForVisit(visit.id);
  }

  async createForVisit(visitId: string) {
    const existing = await this.repository.byVisit(visitId);
    if (existing) return existing;
    const visit = await this.visits.findById(visitId);
    if (!visit) throw new NotFoundException('Visit not found');
    if (!visit.specialtyId) throw new ConflictException('Visit has no specialty');
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counterRef = this.firebase.collection('ticket_counters').doc(`${visit.originHospitalId}-${day}`);
    const ticketRef = this.firebase.collection(TicketCollection).doc();
    const ticket = await this.firebase.getFirestore().runTransaction(async (tx) => {
      const counter = await tx.get(counterRef);
      const next = Number(counter.data()?.value || 0) + 1;
      tx.set(counterRef, { value: next, updatedAt: new Date() }, { merge: true });
      const now = new Date();
      const data = {
        id: ticketRef.id,
        ticketNumber: `${day}-${String(next).padStart(3, '0')}`,
        visitId: visit.id,
        patientId: visit.patientId,
        originHospitalId: visit.originHospitalId,
        specialtyId: visit.specialtyId,
        appointmentId: visit.appointmentId || null,
        referralId: visit.referralId || null,
        urgencyId: visit.urgencyId || null,
        boxId: visit.boxId || null,
        queueNumber: next,
        estimatedWaitMinutes: Math.max(0, (next - 1) * 15),
        createdAt: now,
        updatedAt: now,
      };
      tx.set(ticketRef, data);
      return data;
    });
    await this.visits.update(visit.id, { ticketId: ticket.id, updatedAt: new Date() });
    this.events.emit('ticket.created', ticket);
    return ticket;
  }

  async assertScope(originHospitalId: string, user: User) {
    if (user.role !== UserRole.ADMIN && originHospitalId !== user.hospitalId) {
      throw new ForbiddenException('Ticket is outside your hospital');
    }
  }
  async byVisit(id: string, user: User) {
    const item = await this.repository.byVisit(id);
    if (!item) throw new NotFoundException('Ticket not found');
    await this.assertScope(item.originHospitalId, user); return item;
  }
  async byNumber(number: string, user: User) {
    const item = await this.repository.byNumber(number);
    if (!item) throw new NotFoundException('Ticket not found');
    await this.assertScope(item.originHospitalId, user); return item;
  }
  async mine(user: User) {
    return user.hospitalId ? this.repository.byHospital(user.hospitalId) : [];
  }
}
