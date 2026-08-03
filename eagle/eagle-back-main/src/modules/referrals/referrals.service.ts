import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReferralsRepository } from './referrals.repository';
import { CreateReferralDto, AcceptReferralDto, RejectReferralDto, UpdateReferralDto } from './dto';
import { Referral, ReferralStatus } from './entities/referral.entity';
import { HospitalScopeService } from '../hospitals/hospital-scope.service';
import { PatientsRepository } from '../patients/patients.repository';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly referralsRepository: ReferralsRepository,
    private readonly patientsRepository: PatientsRepository,
    private readonly hospitalScopeService: HospitalScopeService,
  ) {}

  /**
   * Create a new referral
   */
  async create(
    createDto: CreateReferralDto,
    user: User,
  ): Promise<Referral> {
    if (!user.hospitalId) {
      throw new ForbiddenException('User is not assigned to a hospital');
    }

    const patient = await this.patientsRepository.findById(createDto.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createDto.patientId} not found`,
      );
    }
    if (patient.hospitalId !== user.hospitalId) {
      throw new ForbiddenException(
        'The patient does not belong to your hospital',
      );
    }

    await this.hospitalScopeService.assertReferralRoute(
      user.hospitalId,
      createDto.toHospitalId,
    );

    const referralData: Partial<Referral> = {
      ...createDto,
      estimatedArrivalTime: createDto.estimatedArrivalTime
        ? new Date(createDto.estimatedArrivalTime)
        : null,
      referredBy: user.id,
      fromHospitalId: user.hospitalId,
      status: ReferralStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.referralsRepository.create(referralData);
  }

  /**
   * Get all referrals (ADMIN only)
   */
  async findAll(): Promise<Referral[]> {
    return await this.referralsRepository.findAll();
  }

  /**
   * Get referral by ID
   */
  private async findRequired(id: string): Promise<Referral> {
    const referral = await this.referralsRepository.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }
    return referral;
  }

  async findById(id: string, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.assertCanReadReferral(user, referral);
    return referral;
  }

  /**
   * Get referrals sent from a hospital
   */
  async findByFromHospital(hospitalId: string): Promise<Referral[]> {
    return await this.referralsRepository.findByFromHospital(hospitalId);
  }

  /**
   * Get referrals received by a hospital
   */
  async findByToHospital(hospitalId: string): Promise<Referral[]> {
    return await this.referralsRepository.findByToHospital(hospitalId);
  }

  /**
   * Get pending referrals for a hospital (inbox)
   */
  async findPendingByHospital(hospitalId: string): Promise<Referral[]> {
    return await this.referralsRepository.findPendingByHospital(hospitalId);
  }

  /**
   * Get referrals by patient
   */
  async findByPatient(patientId: string, user: User): Promise<Referral[]> {
    const referrals = await this.referralsRepository.findByPatient(patientId);
    return referrals.filter((referral) => this.canReadReferral(user, referral));
  }

  /**
   * Get referrals by status
   */
  async findByStatus(status: ReferralStatus, user: User): Promise<Referral[]> {
    const referrals = await this.referralsRepository.findByStatus(status);
    return referrals.filter((referral) => this.canReadReferral(user, referral));
  }

  /**
   * Get referrals created by a user
   */
  async findByReferrer(userId: string): Promise<Referral[]> {
    return await this.referralsRepository.findByReferrer(userId);
  }

  /**
   * Accept a referral (receiving hospital)
   */
  async accept(id: string, user: User, acceptDto?: AcceptReferralDto): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.toHospitalId);

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Only pending referrals can be accepted');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.ACCEPTED,
      acceptedBy: user.id,
      ...(acceptDto?.acceptanceNotes
        ? { acceptanceNotes: acceptDto.acceptanceNotes }
        : {}),
      acceptedAt: new Date(),
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Reject a referral (receiving hospital)
   */
  async reject(id: string, rejectDto: RejectReferralDto, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.toHospitalId);

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Only pending referrals can be rejected');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.REJECTED,
      rejectionReason: rejectDto.rejectionReason,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Mark referral as in transit
   */
  async markInTransit(id: string, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.fromHospitalId);

    if (referral.status !== ReferralStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted referrals can be marked as in transit');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.IN_TRANSIT,
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Complete a referral (patient arrived)
   */
  async complete(id: string, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.toHospitalId);

    if (![ReferralStatus.ACCEPTED, ReferralStatus.IN_TRANSIT].includes(referral.status)) {
      throw new BadRequestException('Only accepted or in-transit referrals can be completed');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Cancel a referral
   */
  async cancel(id: string, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.fromHospitalId);

    if ([ReferralStatus.COMPLETED, ReferralStatus.CANCELLED].includes(referral.status)) {
      throw new BadRequestException('Cannot cancel completed or already cancelled referrals');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.CANCELLED,
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Update referral details
   */
  async update(id: string, updateDto: UpdateReferralDto, user: User): Promise<Referral> {
    const referral = await this.findRequired(id);
    this.hospitalScopeService.assertAssignedToHospital(user, referral.fromHospitalId);

    if (
      updateDto.patientId !== undefined ||
      updateDto.toHospitalId !== undefined ||
      updateDto.status !== undefined
    ) {
      throw new BadRequestException(
        'Patient, destination, and status cannot be changed through this endpoint',
      );
    }

    return await this.referralsRepository.update(id, {
      ...updateDto,
      estimatedArrivalTime: updateDto.estimatedArrivalTime
        ? new Date(updateDto.estimatedArrivalTime)
        : undefined,
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Delete a referral (ADMIN only)
   */
  async delete(id: string): Promise<void> {
    await this.findRequired(id);
    await this.referralsRepository.delete(id);
  }

  /**
   * Get statistics for a hospital
   */
  async getHospitalStats(hospitalId: string): Promise<{
    sent: number;
    received: number;
    pending: number;
    accepted: number;
    rejected: number;
  }> {
    const [sent, received, pending] = await Promise.all([
      this.findByFromHospital(hospitalId),
      this.findByToHospital(hospitalId),
      this.findPendingByHospital(hospitalId),
    ]);

    const accepted = received.filter((r) => r.status === ReferralStatus.ACCEPTED).length;
    const rejected = received.filter((r) => r.status === ReferralStatus.REJECTED).length;

    return {
      sent: sent.length,
      received: received.length,
      pending: pending.length,
      accepted,
      rejected,
    };
  }

  private canReadReferral(user: User, referral: Referral): boolean {
    return (
      user.role === UserRole.ADMIN ||
      (!!user.hospitalId &&
        [referral.fromHospitalId, referral.toHospitalId].includes(
          user.hospitalId,
        ))
    );
  }

  private assertCanReadReferral(user: User, referral: Referral): void {
    if (!this.canReadReferral(user, referral)) {
      throw new ForbiddenException(
        'This referral is outside your assigned hospital scope',
      );
    }
  }
}
