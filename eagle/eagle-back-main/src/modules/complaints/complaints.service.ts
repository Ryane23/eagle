import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ComplaintsRepository } from './complaints.repository';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';
import { Complaint, ComplaintStatus } from './entities/complaint.entity';
import { FirebaseService } from '../../config/firebase';
import { UserCollection } from '../users/entities/user.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintsRepository: ComplaintsRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Create a new complaint
   */
  async create(createComplaintDto: CreateComplaintDto, complainedBy: string): Promise<Complaint> {
    // Get complainant name
    const complainantDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(complainedBy)
      .get();

    const complainantName = complainantDoc.exists
      ? (complainantDoc.data() as { name?: string })?.name || 'Unknown'
      : 'Unknown';

    const complaintData = {
      ...createComplaintDto,
      complainedBy,
      complainedByName: complainantName,
      status: ComplaintStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.complaintsRepository.create(complaintData);
  }

  /**
   * Get all complaints (Admin only)
   */
  async findAll(filters?: {
    status?: ComplaintStatus;
    type?: string;
    priority?: string;
    hospitalId?: string;
  }): Promise<Complaint[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return await this.complaintsRepository.findAll();
    }

    if (filters.status) {
      return await this.complaintsRepository.findByStatus(filters.status);
    }

    if (filters.type) {
      return await this.complaintsRepository.findByType(filters.type as any);
    }

    if (filters.priority) {
      return await this.complaintsRepository.findByPriority(filters.priority as any);
    }

    if (filters.hospitalId) {
      return await this.complaintsRepository.findByHospital(filters.hospitalId);
    }

    return await this.complaintsRepository.findAll();
  }

  /**
   * Get complaints by complainant (user's own complaints)
   */
  async findByComplainant(userId: string): Promise<Complaint[]> {
    return await this.complaintsRepository.findByComplainant(userId);
  }

  /**
   * Get complaint by ID
   */
  async findById(id: string, userId?: string, isAdmin?: boolean): Promise<Complaint> {
    const complaint = await this.complaintsRepository.findById(id);
    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    // Users can only view their own complaints unless they're admin
    if (!isAdmin && complaint.complainedBy !== userId) {
      throw new ForbiddenException('You do not have permission to view this complaint');
    }

    return complaint;
  }

  /**
   * Update complaint
   */
  async update(
    id: string,
    updateComplaintDto: UpdateComplaintDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Complaint> {
    const complaint = await this.findById(id, userId, isAdmin);

    // Only admin can update status, priority, and resolution notes
    if (!isAdmin && (updateComplaintDto.status || updateComplaintDto.priority || updateComplaintDto.resolutionNotes)) {
      throw new ForbiddenException('Only admins can update complaint status, priority, and resolution');
    }

    // If resolving, set resolvedBy and resolvedAt
    if (isAdmin && updateComplaintDto.status === ComplaintStatus.RESOLVED) {
      updateComplaintDto = {
        ...updateComplaintDto,
        resolvedBy: userId,
        resolvedAt: new Date(),
      } as any;
    }

    const updated = await this.complaintsRepository.update(id, updateComplaintDto);
    if (!updated) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Delete complaint (Admin only)
   */
  async delete(id: string): Promise<void> {
    const complaint = await this.complaintsRepository.findById(id);
    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    await this.complaintsRepository.delete(id);
  }
}

