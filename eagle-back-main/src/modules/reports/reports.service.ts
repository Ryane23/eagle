import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { CreateReportDto, UpdateReportDto } from './dto';
import { Report, ReportStatus } from './entities/report.entity';
import { FirebaseService } from 'src/config/firebase';
import { UserCollection } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Create a new report
   */
  async create(createReportDto: CreateReportDto, reportedBy: string): Promise<Report> {
    // Get reporter name
    const reporterDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(reportedBy)
      .get();

    const reporterName = reporterDoc.exists
      ? (reporterDoc.data() as { name?: string })?.name || 'Unknown'
      : 'Unknown';

    const reportData = {
      ...createReportDto,
      reportedBy,
      reportedByName: reporterName,
      status: ReportStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.reportsRepository.create(reportData);
  }

  /**
   * Get all reports (Admin only)
   */
  async findAll(filters?: {
    status?: ReportStatus;
    type?: string;
    hospitalId?: string;
  }): Promise<Report[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return await this.reportsRepository.findAll();
    }

    if (filters.status) {
      return await this.reportsRepository.findByStatus(filters.status);
    }

    if (filters.type) {
      return await this.reportsRepository.findByType(filters.type as any);
    }

    if (filters.hospitalId) {
      return await this.reportsRepository.findByHospital(filters.hospitalId);
    }

    return await this.reportsRepository.findAll();
  }

  /**
   * Get reports by reporter (user's own reports)
   */
  async findByReporter(userId: string): Promise<Report[]> {
    return await this.reportsRepository.findByReporter(userId);
  }

  /**
   * Get report by ID
   */
  async findById(id: string, userId?: string, isAdmin?: boolean): Promise<Report> {
    const report = await this.reportsRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Users can only view their own reports unless they're admin
    if (!isAdmin && report.reportedBy !== userId) {
      throw new ForbiddenException('You do not have permission to view this report');
    }

    return report;
  }

  /**
   * Update report
   */
  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Report> {
    const report = await this.findById(id, userId, isAdmin);

    // Only admin can update status and resolution notes
    if (!isAdmin && (updateReportDto.status || updateReportDto.resolutionNotes)) {
      throw new ForbiddenException('Only admins can update report status');
    }

    // If resolving, set resolvedBy and resolvedAt
    if (isAdmin && updateReportDto.status === ReportStatus.RESOLVED) {
      updateReportDto = {
        ...updateReportDto,
        resolvedBy: userId,
        resolvedAt: new Date(),
      } as any;
    }

    const updated = await this.reportsRepository.update(id, updateReportDto);
    if (!updated) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Delete report (Admin only)
   */
  async delete(id: string): Promise<void> {
    const report = await this.reportsRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    await this.reportsRepository.delete(id);
  }
}

