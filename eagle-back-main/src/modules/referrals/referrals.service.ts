import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReferralsRepository } from './referrals.repository';
import { CreateReferralDto, AcceptReferralDto, RejectReferralDto, UpdateReferralDto } from './dto';
import { Referral, ReferralStatus } from './entities/referral.entity';

@Injectable()
export class ReferralsService {
  constructor(private readonly referralsRepository: ReferralsRepository) {}

  /**
   * Create a new referral
   */
  async create(
    createDto: CreateReferralDto,
    referredBy: string,
    fromHospitalId: string,
  ): Promise<Referral> {
    // Validate: Cannot refer to same hospital
    if (createDto.toHospitalId === fromHospitalId) {
      throw new BadRequestException('Cannot refer patient to the same hospital');
    }

    const referralData: Partial<Referral> = {
      ...createDto,
      estimatedArrivalTime: createDto.estimatedArrivalTime
        ? new Date(createDto.estimatedArrivalTime)
        : null,
      referredBy,
      fromHospitalId,
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
  async findById(id: string): Promise<Referral | null> {
    const referral = await this.referralsRepository.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }
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
  async findByPatient(patientId: string): Promise<Referral[]> {
    return await this.referralsRepository.findByPatient(patientId);
  }

  /**
   * Get referrals by status
   */
  async findByStatus(status: ReferralStatus): Promise<Referral[]> {
    return await this.referralsRepository.findByStatus(status);
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
  async accept(id: string, acceptedBy: string, acceptDto?: AcceptReferralDto): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Only pending referrals can be accepted');
    }

    return await this.referralsRepository.update(id, {
      status: ReferralStatus.ACCEPTED,
      acceptedBy,
      acceptedAt: new Date(),
      updatedAt: new Date(),
    }) as Referral;
  }

  /**
   * Reject a referral (receiving hospital)
   */
  async reject(id: string, rejectDto: RejectReferralDto): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

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
  async markInTransit(id: string): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

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
  async complete(id: string): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

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
  async cancel(id: string): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

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
  async update(id: string, updateDto: UpdateReferralDto): Promise<Referral> {
    const referral = await this.findById(id);
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
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
    await this.findById(id);
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
}
