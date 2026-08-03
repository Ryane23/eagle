import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatientsRepository } from '../patients/patients.repository';
import { User, UserRole } from '../users/entities/user.entity';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly patients: PatientsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: any, user: User) {
    if (!user.hospitalId) throw new ForbiddenException('Hospital assignment required');
    const patient = await this.patients.findById(dto.patientId);
    if (!patient || patient.hospitalId !== user.hospitalId) {
      throw new ForbiddenException('Patient is outside your hospital');
    }
    const now = new Date();
    const appointment = await this.repository.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      originHospitalId: patient.hospitalId,
      status: AppointmentStatus.BOOKED,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });
    this.events.emit('appointment.created', appointment);
    return appointment;
  }

  findMine(user: User) {
    return user.hospitalId ? this.repository.findByHospital(user.hospitalId) : [];
  }

  private async scoped(id: string, user: User) {
    const appointment = await this.repository.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (user.role !== UserRole.ADMIN && appointment.originHospitalId !== user.hospitalId) {
      throw new ForbiddenException('Appointment is outside your hospital');
    }
    return appointment;
  }

  async setStatus(id: string, status: AppointmentStatus, user: User) {
    const appointment = await this.scoped(id, user);
    if ([AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED].includes(appointment.status)) {
      throw new BadRequestException('Appointment is already terminal');
    }
    const updated = await this.repository.update(id, {
      status,
      ...(status === AppointmentStatus.CHECKED_IN ? { checkedInAt: new Date() } : {}),
      updatedAt: new Date(),
    });
    this.events.emit(`appointment.${status.toLowerCase()}`, updated);
    return updated;
  }
}
