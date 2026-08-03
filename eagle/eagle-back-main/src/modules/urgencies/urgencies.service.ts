import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HospitalScopeService } from '../hospitals/hospital-scope.service';
import { PatientsRepository } from '../patients/patients.repository';
import { User, UserRole } from '../users/entities/user.entity';
import { AssignUrgencyDto, CreateUrgencyDto, ValidateUrgencyDto } from './dto/urgency.dto';
import { UrgencyLevel, UrgencyStatus } from './entities/urgency.entity';
import { UrgenciesRepository } from './urgencies.repository';

@Injectable()
export class UrgenciesService {
  constructor(
    private readonly repository: UrgenciesRepository,
    private readonly patients: PatientsRepository,
    private readonly hospitalScope: HospitalScopeService,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateUrgencyDto, user: User) {
    if (!user.hospitalId) throw new ForbiddenException('Hospital assignment required');
    const patient = await this.patients.findById(dto.patientId);
    if (!patient || patient.hospitalId !== user.hospitalId) {
      throw new ForbiddenException('Patient is outside your hospital');
    }
    const now = new Date();
    const urgency = await this.repository.create({
      ...dto,
      hospitalId: patient.hospitalId,
      createdBy: user.id,
      status: UrgencyStatus.PENDING,
      validationHistory: [],
      createdAt: now,
      updatedAt: now,
    });
    this.events.emit('urgency.created', urgency);
    if (urgency.level === UrgencyLevel.CRITICAL) {
      this.events.emit('urgency.critical', urgency);
    }
    return urgency;
  }

  async required(id: string) {
    const urgency = await this.repository.findById(id);
    if (!urgency) throw new NotFoundException('Urgency not found');
    return urgency;
  }

  async findForUser(user: User, status?: UrgencyStatus) {
    let list = status
      ? await this.repository.findByStatus(status)
      : await this.repository.findAll();
    if (user.role === UserRole.ADMIN) return list;
    if (!user.hospitalId) return [];
    const scope = await this.hospitalScope.getScopeHospitalIds(user.hospitalId);
    return list.filter((item) => scope.includes(item.hospitalId));
  }

  async findOne(id: string, user: User) {
    const urgency = await this.required(id);
    if (user.role !== UserRole.ADMIN) {
      await this.hospitalScope.assertCanAccessHospital(user, urgency.hospitalId);
    }
    return urgency;
  }

  async validate(id: string, dto: ValidateUrgencyDto, user: User) {
    const urgency = await this.required(id);
    if (urgency.status !== UrgencyStatus.PENDING) {
      throw new BadRequestException('Only pending urgencies can be validated');
    }
    const history = [...(urgency.validationHistory || []), {
      level: dto.newLevel,
      justification: dto.justification,
      validatedBy: user.id,
      validatedAt: new Date(),
    }];
    const updated = await this.repository.update(id, {
      level: dto.newLevel,
      status: UrgencyStatus.VALIDATED_PRIMARY_SECRETARY,
      validationHistory: history,
      updatedAt: new Date(),
    });
    this.events.emit('urgency.validated', updated);
    return updated;
  }

  async approve(id: string, user: User) {
    const urgency = await this.required(id);
    if (urgency.status !== UrgencyStatus.VALIDATED_PRIMARY_SECRETARY) {
      throw new BadRequestException('Urgency must be validated first');
    }
    const updated = await this.repository.update(id, {
      status: UrgencyStatus.APPROVED,
      updatedAt: new Date(),
    });
    this.events.emit('urgency.approved', updated);
    return updated;
  }

  async assign(id: string, dto: AssignUrgencyDto) {
    const urgency = await this.required(id);
    if (![UrgencyStatus.APPROVED, UrgencyStatus.VALIDATED_PRIMARY_SECRETARY].includes(urgency.status)) {
      throw new BadRequestException('Urgency is not ready for assignment');
    }
    const updated = await this.repository.update(id, {
      assignedDoctorId: dto.assignedDoctorId,
      scheduledAt: new Date(dto.scheduledAt),
      status: UrgencyStatus.ASSIGNED,
      updatedAt: new Date(),
    });
    this.events.emit('urgency.assigned', updated);
    return updated;
  }

  async setStatus(id: string, status: UrgencyStatus) {
    const urgency = await this.required(id);
    const allowed: Partial<Record<UrgencyStatus, UrgencyStatus[]>> = {
      [UrgencyStatus.ASSIGNED]: [UrgencyStatus.IN_PROGRESS, UrgencyStatus.REJECTED],
      [UrgencyStatus.IN_PROGRESS]: [UrgencyStatus.COMPLETED],
      [UrgencyStatus.PENDING]: [UrgencyStatus.REJECTED],
      [UrgencyStatus.VALIDATED_PRIMARY_SECRETARY]: [UrgencyStatus.REJECTED],
      [UrgencyStatus.APPROVED]: [UrgencyStatus.REJECTED],
    };
    if (!(allowed[urgency.status] || []).includes(status)) {
      throw new BadRequestException(`Invalid urgency transition ${urgency.status} -> ${status}`);
    }
    const updated = await this.repository.update(id, { status, updatedAt: new Date() });
    this.events.emit('urgency.status.changed', updated);
    return updated;
  }
}
