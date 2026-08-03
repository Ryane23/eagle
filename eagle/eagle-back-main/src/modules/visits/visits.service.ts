import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FirebaseService } from '../../config/firebase';
import { PatientsRepository } from '../patients/patients.repository';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateVisitDto, SelectVisitSpecialtyDto } from './dto/create-visit.dto';
import {
  Visit,
  VisitCollection,
  VisitStatus,
} from './entities/visit.entity';
import { VisitsRepository } from './visits.repository';

const transitions: Record<VisitStatus, VisitStatus[]> = {
  [VisitStatus.REGISTERED]: [VisitStatus.ARRIVED, VisitStatus.CANCELLED],
  [VisitStatus.ARRIVED]: [VisitStatus.WAITING, VisitStatus.CANCELLED],
  [VisitStatus.WAITING]: [VisitStatus.IN_PREPARATION, VisitStatus.CANCELLED],
  [VisitStatus.IN_PREPARATION]: [VisitStatus.READY, VisitStatus.CANCELLED],
  [VisitStatus.READY]: [VisitStatus.WAITING_FOR_CONSULTATION, VisitStatus.QUEUED, VisitStatus.CANCELLED],
  [VisitStatus.WAITING_FOR_CONSULTATION]: [VisitStatus.IN_CONSULTATION, VisitStatus.CANCELLED, VisitStatus.MISSED],
  [VisitStatus.WAITING_FOR_VITALS]: [VisitStatus.IN_PREPARATION, VisitStatus.VITALS_COMPLETED, VisitStatus.CANCELLED],
  [VisitStatus.VITALS_COMPLETED]: [VisitStatus.READY_FOR_SCHEDULING, VisitStatus.CANCELLED],
  [VisitStatus.READY_FOR_SCHEDULING]: [VisitStatus.QUEUED, VisitStatus.CANCELLED],
  [VisitStatus.QUEUED]: [VisitStatus.IN_CONSULTATION, VisitStatus.CANCELLED, VisitStatus.MISSED],
  [VisitStatus.IN_CONSULTATION]: [VisitStatus.COMPLETED, VisitStatus.CANCELLED],
  [VisitStatus.COMPLETED]: [],
  [VisitStatus.CANCELLED]: [],
  [VisitStatus.MISSED]: [],
};

@Injectable()
export class VisitsService {
  constructor(
    private readonly repository: VisitsRepository,
    private readonly patientsRepository: PatientsRepository,
    private readonly events: EventEmitter2,
    private readonly firebase: FirebaseService,
  ) {}

  async create(dto: CreateVisitDto, user: User): Promise<Visit> {
    if (!user.hospitalId) throw new ForbiddenException('Hospital assignment required');
    const patient = await this.patientsRepository.findById(dto.patientId);
    if (!patient) throw new NotFoundException('Patient not found');
    if (patient.hospitalId !== user.hospitalId) {
      throw new ForbiddenException('Patient belongs to another hospital');
    }
    const now = new Date();
    const year = now.getUTCFullYear();
    const day = now.toISOString().slice(0, 10).replace(/-/g, '');
    const consultationCounterRef = this.firebase
      .collection('visit_counters')
      .doc(`consultation-${year}`);
    const passingCounterRef = this.firebase
      .collection('visit_counters')
      .doc(`passing-${patient.hospitalId}-${day}`);
    const visitRef = this.firebase.collection(VisitCollection).doc();
    const visit = await this.firebase.getFirestore().runTransaction(async (tx) => {
      const [consultationCounter, passingCounter] = await Promise.all([
        tx.get(consultationCounterRef),
        tx.get(passingCounterRef),
      ]);
      const consultationSequence =
        Number(consultationCounter.data()?.value || 0) + 1;
      const passingSequence = Number(passingCounter.data()?.value || 0) + 1;
      tx.set(
        consultationCounterRef,
        { value: consultationSequence, updatedAt: now },
        { merge: true },
      );
      tx.set(
        passingCounterRef,
        { value: passingSequence, updatedAt: now },
        { merge: true },
      );
      const data: Visit = {
        id: visitRef.id,
        ...dto,
        complaint: dto.complaint || 'Demande de consultation',
        originHospitalId: patient.hospitalId,
        registeredBy: user.id,
        registeredByRole: user.role,
        consultationNumber: `PAT-${year}-${String(consultationSequence).padStart(6, '0')}`,
        passingNumber: `A-${String(passingSequence).padStart(3, '0')}`,
        status: VisitStatus.WAITING,
        arrivedAt: now,
        arrivedBy: user.id,
        checkedInAt: now,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(visitRef, data);
      return data;
    });
    this.events.emit('visit.created', visit);
    return visit;
  }

  async findRequired(id: string) {
    const visit = await this.repository.findById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  private assertScope(visit: Visit, user: User) {
    if (user.role !== UserRole.ADMIN && visit.originHospitalId !== user.hospitalId) {
      throw new ForbiddenException('Visit is outside your hospital');
    }
  }

  async findMine(user: User) {
    if (!user.hospitalId) return [];
    return this.repository.findByHospital(user.hospitalId);
  }

  async findOne(id: string, user: User) {
    const visit = await this.findRequired(id);
    this.assertScope(visit, user);
    return visit;
  }

  async transition(id: string, status: VisitStatus, user: User) {
    const visit = await this.findOne(id, user);
    if (!transitions[visit.status].includes(status)) {
      throw new BadRequestException(`Invalid visit transition ${visit.status} -> ${status}`);
    }
    const now = new Date();
    const updated = await this.repository.update(id, {
      status,
      ...(status === VisitStatus.IN_PREPARATION
        ? { preparationStartedAt: now, preparationStartedBy: user.id }
        : {}),
      ...(status === VisitStatus.READY ? { vitalsCompletedAt: now } : {}),
      ...(status === VisitStatus.WAITING_FOR_CONSULTATION ? { checkedInAt: now } : {}),
      ...(status === VisitStatus.VITALS_COMPLETED ? { vitalsCompletedAt: now } : {}),
      ...(status === VisitStatus.COMPLETED ? { completedAt: now } : {}),
      updatedAt: now,
    });
    if (!updated) throw new NotFoundException('Visit not found');
    this.events.emit('visit.status.changed', { ...updated, previousStatus: visit.status });
    return updated;
  }

  async selectSpecialty(id: string, dto: SelectVisitSpecialtyDto, user: User) {
    const visit = await this.findOne(id, user);
    if (
      visit.status !== VisitStatus.VITALS_COMPLETED &&
      visit.status !== VisitStatus.IN_PREPARATION &&
      visit.status !== VisitStatus.READY
    ) {
      throw new BadRequestException('Vitals must be completed before specialty selection');
    }
    const updated = await this.repository.update(id, {
      specialtyId: dto.specialtyId,
      boxId: dto.boxId || null,
      status: VisitStatus.READY,
      updatedAt: new Date(),
    });
    if (!updated) throw new NotFoundException('Visit not found');
    this.events.emit('visit.ready-for-scheduling', updated);
    return updated;
  }

  async summary(user: User) {
    const visits = await this.findMine(user);
    const count = (status: VisitStatus) => visits.filter((v) => v.status === status).length;
    return {
      registrations: visits.length,
      registered: count(VisitStatus.REGISTERED),
      arrived: count(VisitStatus.ARRIVED),
      waiting: count(VisitStatus.WAITING) + count(VisitStatus.WAITING_FOR_VITALS),
      inPreparation: count(VisitStatus.IN_PREPARATION),
      ready: count(VisitStatus.READY) + count(VisitStatus.READY_FOR_SCHEDULING),
      waitingForVitals: count(VisitStatus.WAITING_FOR_VITALS) + count(VisitStatus.WAITING),
      vitalsCompleted: count(VisitStatus.VITALS_COMPLETED) + count(VisitStatus.READY),
      waitingForConsultation:
        count(VisitStatus.WAITING_FOR_CONSULTATION) +
        count(VisitStatus.READY_FOR_SCHEDULING) +
        count(VisitStatus.QUEUED),
      inConsultation: count(VisitStatus.IN_CONSULTATION),
      completed: count(VisitStatus.COMPLETED),
    };
  }
}
