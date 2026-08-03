import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FirebaseService } from '../../config/firebase';
import { HospitalType } from '../hospitals/entities/hospital.entity';
import { HospitalsService } from '../hospitals/hospitals.service';
import { User, UserRole } from '../users/entities/user.entity';
import { ConsultationBoxesRepository } from './consultation-boxes.repository';
import {
  ConsultationBox,
  ConsultationBoxCollection,
  ConsultationBoxStatus,
} from './entities/consultation-box.entity';
import {
  AdminConsultationBoxStatus,
  CreateConsultationBoxDto,
} from './dto/consultation-box.dto';

@Injectable()
export class ConsultationBoxesService {
  constructor(
    private readonly repository: ConsultationBoxesRepository,
    private readonly firebase: FirebaseService,
    private readonly hospitals: HospitalsService,
    private readonly events: EventEmitter2,
  ) {}

  async create(
    dto: CreateConsultationBoxDto,
  ) {
    const hospital = await this.hospitals.findById(dto.hospitalId);
    if (hospital.type !== HospitalType.SUB) {
      throw new ConflictException('Consultation boxes can only belong to SUB hospitals');
    }
    const existing = (await this.repository.findByHospital(dto.hospitalId)).find(
      (box) => box.code.toLowerCase() === dto.code.toLowerCase(),
    );
    if (existing) throw new ConflictException('Box code already exists in this hospital');
    const now = new Date();
    return this.repository.create({
      ...dto,
      defaultSpecialtyId: dto.defaultSpecialtyId || null,
      currentSpecialtyId: dto.defaultSpecialtyId || null,
      status: ConsultationBoxStatus.AVAILABLE,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findForAdmin(hospitalId?: string) {
    if (hospitalId) {
      await this.hospitals.findById(hospitalId);
    }
    const boxes = hospitalId
      ? await this.repository.findByHospital(hospitalId)
      : await this.repository.findAll();
    return boxes.sort(
      (left, right) =>
        left.hospitalId.localeCompare(right.hospitalId) ||
        left.code.localeCompare(right.code),
    );
  }

  async findMine(user: User) {
    if (!user.hospitalId) return [];
    return (await this.repository.findByHospital(user.hospitalId))
      .filter((box) => box.isActive)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  private async scoped(id: string, user: User) {
    const box = await this.repository.findById(id);
    if (!box) throw new NotFoundException('Consultation box not found');
    if (user.role !== UserRole.ADMIN && box.hospitalId !== user.hospitalId) {
      throw new ForbiddenException('Box is outside your hospital');
    }
    return box;
  }

  async setStatus(
    id: string,
    status: AdminConsultationBoxStatus,
    user: User,
  ) {
    const box = await this.scoped(id, user);
    if (box.activeVisitId) {
      throw new ConflictException(
        'Release the active consultation before changing this box status',
      );
    }
    const updated = await this.repository.update(id, {
      status,
      updatedAt: new Date(),
    });
    this.events.emit('box.status.changed', updated);
    return updated;
  }

  async assignSpecialty(
    id: string,
    dto: { specialtyId: string; startsAt?: string; endsAt?: string },
    user: User,
  ) {
    await this.scoped(id, user);
    const updated = await this.repository.update(id, {
      currentSpecialtyId: dto.specialtyId,
      assignmentStartsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
      assignmentEndsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      assignedBy: user.id,
      updatedAt: new Date(),
    });
    this.events.emit('box.specialty.assigned', updated);
    return updated;
  }

  async reserve(
    id: string,
    visitId: string,
    consultationId: string | undefined,
    user: User,
  ) {
    const scoped = await this.scoped(id, user);
    const ref = this.firebase.collection(ConsultationBoxCollection).doc(id);
    const visitRef = this.firebase.collection('visits').doc(visitId);
    const result = await this.firebase.getFirestore().runTransaction(async (tx) => {
      const [snapshot, visitSnapshot] = await Promise.all([
        tx.get(ref),
        tx.get(visitRef),
      ]);
      const box = { id: snapshot.id, ...snapshot.data() } as ConsultationBox;
      if (!visitSnapshot.exists) {
        throw new NotFoundException('Visit not found');
      }
      const visit = visitSnapshot.data()!;
      if (visit.originHospitalId !== box.hospitalId) {
        throw new ForbiddenException('Visit is outside this box hospital');
      }
      if (
        box.status !== ConsultationBoxStatus.AVAILABLE &&
        box.activeVisitId !== visitId
      ) {
        throw new ConflictException('Consultation box is already occupied');
      }
      if (!box.currentSpecialtyId && !box.defaultSpecialtyId) {
        throw new ConflictException('Assign a specialty before reserving this box');
      }
      if (
        visit.specialtyId !==
        (box.currentSpecialtyId || box.defaultSpecialtyId)
      ) {
        throw new ConflictException(
          'Visit specialty is incompatible with this box',
        );
      }
      const update = {
        status: ConsultationBoxStatus.RESERVED,
        activeVisitId: visitId,
        activeConsultationId: consultationId || null,
        reservedAt: new Date(),
        updatedAt: new Date(),
      };
      tx.update(ref, update);
      tx.set(
        visitRef,
        { boxId: id, updatedAt: new Date() },
        { merge: true },
      );
      return { ...scoped, ...update };
    });
    this.events.emit('box.reserved', result);
    return result;
  }

  async release(id: string, user: User) {
    await this.scoped(id, user);
    const updated = await this.repository.update(id, {
      status: ConsultationBoxStatus.AVAILABLE,
      activeVisitId: null,
      activeConsultationId: null,
      reservedAt: null,
      updatedAt: new Date(),
    });
    this.events.emit('box.released', updated);
    return updated;
  }

  async findAvailable(hospitalId: string, specialtyId: string) {
    return (await this.repository.findByHospital(hospitalId)).filter(
      (box) =>
        box.isActive &&
        box.status === ConsultationBoxStatus.AVAILABLE &&
        (box.currentSpecialtyId || box.defaultSpecialtyId) === specialtyId,
    );
  }
}
