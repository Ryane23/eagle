import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FollowupsRepository } from './followups.repository';
import { CreateFollowupDto, UpdateFollowupDto } from './dto';
import {
  Followup,
  FollowupStatus,
} from './entities/followup.entity';
import { EncryptionService } from 'src/common/services/encryption.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class FollowupsService {
  constructor(
    private readonly followupsRepository: FollowupsRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Create follow-up appointment
   */
  async create(
    createFollowupDto: CreateFollowupDto,
    createdBy: string,
    userRole: UserRole,
  ): Promise<Followup> {
    // Verify consultation exists (can be enhanced with consultation service)
    // For now, we'll just create the follow-up

    const followupData: Partial<Followup> = {
      ...createFollowupDto,
      scheduledAt: new Date(createFollowupDto.scheduledAt),
      status: createFollowupDto.status || FollowupStatus.SCHEDULED,
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Encrypt sensitive fields
    if (followupData.notes) {
      followupData.notes = this.encryptionService.encrypt(followupData.notes);
    }
    if (followupData.instructions) {
      followupData.instructions = this.encryptionService.encrypt(
        followupData.instructions,
      );
    }

    return await this.followupsRepository.create(followupData);
  }

  /**
   * Get all follow-ups (with access control)
   */
  async findAll(
    userRole: UserRole,
    userId?: string,
    userHospitalId?: string | null,
  ): Promise<Followup[]> {
    let followups: Followup[];

    if (userRole === UserRole.DOCTOR && userId) {
      followups = await this.followupsRepository.findByDoctorId(userId);
    } else if (userRole === UserRole.SECONDARY_SECRETARY || userRole === UserRole.NURSE) {
      // For secondary secretary and nurse, we'd need to filter by hospital
      // This requires patient lookup, so for now return all (can be enhanced)
      followups = await this.followupsRepository.findAll();
    } else {
      // ADMIN, PRIMARY_SECRETARY can see all
      followups = await this.followupsRepository.findAll();
    }

    // Decrypt sensitive fields
    return followups.map(followup =>
      this.encryptionService.decryptFields(followup, [
        'notes',
        'instructions',
        'progressNotes',
      ]),
    );
  }

  /**
   * Get follow-up by ID
   */
  async findById(
    id: string,
    userRole: UserRole,
    userId?: string,
  ): Promise<Followup> {
    const followup = await this.followupsRepository.findById(id);
    if (!followup) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    // Access control
    if (userRole === UserRole.DOCTOR && userId && followup.doctorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this follow-up',
      );
    }

    // Decrypt sensitive fields
    return this.encryptionService.decryptFields(followup, [
      'notes',
      'instructions',
      'progressNotes',
    ]);
  }

  /**
   * Get follow-ups by patient
   */
  async findByPatient(
    patientId: string,
    userRole: UserRole,
  ): Promise<Followup[]> {
    const followups = await this.followupsRepository.findByPatientId(patientId);

    // Decrypt sensitive fields
    return followups.map(followup =>
      this.encryptionService.decryptFields(followup, [
        'notes',
        'instructions',
        'progressNotes',
      ]),
    );
  }

  /**
   * Get follow-ups by doctor
   */
  async findByDoctor(
    doctorId: string,
    userRole: UserRole,
    requestingUserId?: string,
  ): Promise<Followup[]> {
    // Doctors can only see their own follow-ups
    if (userRole === UserRole.DOCTOR && requestingUserId && doctorId !== requestingUserId) {
      throw new ForbiddenException(
        'You can only view your own follow-ups',
      );
    }

    const followups = await this.followupsRepository.findByDoctorId(doctorId);

    // Decrypt sensitive fields
    return followups.map(followup =>
      this.encryptionService.decryptFields(followup, [
        'notes',
        'instructions',
        'progressNotes',
      ]),
    );
  }

  /**
   * Get upcoming follow-ups
   */
  async findUpcoming(limit: number = 50): Promise<Followup[]> {
    const followups = await this.followupsRepository.findUpcoming(limit);

    // Decrypt sensitive fields
    return followups.map(followup =>
      this.encryptionService.decryptFields(followup, [
        'notes',
        'instructions',
        'progressNotes',
      ]),
    );
  }

  /**
   * Update follow-up
   */
  async update(
    id: string,
    updateFollowupDto: UpdateFollowupDto,
    userRole: UserRole,
    userId?: string,
  ): Promise<Followup> {
    const followup = await this.findById(id, userRole, userId);

    // Access control
    if (userRole === UserRole.DOCTOR && userId && followup.doctorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this follow-up',
      );
    }

    const updateData: Partial<Followup> = {
      updatedAt: new Date(),
    };

    if (updateFollowupDto.scheduledAt) {
      updateData.scheduledAt = new Date(updateFollowupDto.scheduledAt);
    }
    if (updateFollowupDto.status) {
      updateData.status = updateFollowupDto.status;
    }

    // Encrypt sensitive fields before saving
    if (updateFollowupDto.notes !== undefined) {
      updateData.notes = updateFollowupDto.notes
        ? this.encryptionService.encrypt(updateFollowupDto.notes)
        : null;
    }
    if (updateFollowupDto.instructions !== undefined) {
      updateData.instructions = updateFollowupDto.instructions
        ? this.encryptionService.encrypt(updateFollowupDto.instructions)
        : null;
    }
    if (updateFollowupDto.progressNotes !== undefined) {
      updateData.progressNotes = updateFollowupDto.progressNotes
        ? this.encryptionService.encrypt(updateFollowupDto.progressNotes)
        : null;
    }

    const updated = await this.followupsRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    // Decrypt before returning
    return this.encryptionService.decryptFields(updated, [
      'notes',
      'instructions',
      'progressNotes',
    ]);
  }

  /**
   * Complete follow-up
   */
  async complete(
    id: string,
    progressNotes?: string,
    userRole?: UserRole,
    userId?: string,
  ): Promise<Followup> {
    const followup = await this.findById(id, userRole || UserRole.DOCTOR, userId);

    // State machine validation
    if (followup.status === FollowupStatus.COMPLETED) {
      throw new BadRequestException('Follow-up is already completed');
    }

    if (followup.status === FollowupStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled follow-up');
    }

    const updateData: Partial<Followup> = {
      status: FollowupStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    if (progressNotes) {
      // Encrypt progress notes
      updateData.progressNotes = this.encryptionService.encrypt(progressNotes);
    }

    const updated = await this.followupsRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    // Decrypt before returning
    return this.encryptionService.decryptFields(updated, [
      'notes',
      'instructions',
      'progressNotes',
    ]);
  }

  /**
   * Cancel follow-up
   */
  async cancel(
    id: string,
    userRole: UserRole,
    userId?: string,
  ): Promise<Followup> {
    const followup = await this.findById(id, userRole, userId);

    // State machine validation
    if (followup.status === FollowupStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed follow-up');
    }

    if (followup.status === FollowupStatus.CANCELLED) {
      throw new BadRequestException('Follow-up is already cancelled');
    }

    const updated = await this.followupsRepository.update(id, {
      status: FollowupStatus.CANCELLED,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    // Decrypt before returning
    return this.encryptionService.decryptFields(updated, [
      'notes',
      'instructions',
      'progressNotes',
    ]);
  }

  /**
   * Mark follow-up as missed
   */
  async markAsMissed(id: string): Promise<Followup> {
    const followup = await this.followupsRepository.findById(id);
    if (!followup) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    if (followup.status !== FollowupStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot mark follow-up as missed. Current status: ${followup.status}`,
      );
    }

    const updated = await this.followupsRepository.update(id, {
      status: FollowupStatus.MISSED,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    // Decrypt before returning
    return this.encryptionService.decryptFields(updated, [
      'notes',
      'instructions',
      'progressNotes',
    ]);
  }
}
