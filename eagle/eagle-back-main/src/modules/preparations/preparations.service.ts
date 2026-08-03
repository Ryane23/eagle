import {
  Injectable,
  Optional,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PreparationsRepository } from './preparations.repository';
import {
  Preparation,
  PreparationStatus,
} from './entities/preparation.entity';
import {
  CreatePreparationDto,
  UpdatePreparationProgressDto,
  UpdateChecklistDto,
  AddObservationsDto,
} from './dto';
import { PatientsRepository } from '../patients/patients.repository';
import { User } from '../users/entities/user.entity';
import { VisitStatus } from '../visits/entities/visit.entity';
import { VisitsRepository } from '../visits/visits.repository';
import { VisitsService } from '../visits/visits.service';

@Injectable()
export class PreparationsService {
  constructor(
    private readonly preparationsRepository: PreparationsRepository,
    @Optional() private readonly patientsRepository?: PatientsRepository,
    @Optional() private readonly visitsRepository?: VisitsRepository,
    @Optional() private readonly visitsService?: VisitsService,
  ) {}

  /**
   * Create preparation session
   */
  async create(
    createPreparationDto: CreatePreparationDto,
    nurseId: string,
    hospitalId?: string | null,
  ): Promise<Preparation> {
    if (this.patientsRepository && hospitalId) {
      const patient = await this.patientsRepository.findById(createPreparationDto.patientId);
      if (!patient) throw new NotFoundException('Patient not found');
      if (patient.hospitalId !== hospitalId) {
        throw new ForbiddenException('Patient is outside your hospital');
      }
    }
    if (createPreparationDto.visitId && this.visitsRepository && hospitalId) {
      const visit = await this.visitsRepository.findById(
        createPreparationDto.visitId,
      );
      if (!visit) throw new NotFoundException('Visit not found');
      if (
        visit.patientId !== createPreparationDto.patientId ||
        visit.originHospitalId !== hospitalId
      ) {
        throw new ForbiddenException('Visit is outside your hospital');
      }
      if (
        visit.status !== VisitStatus.WAITING &&
        visit.status !== VisitStatus.WAITING_FOR_VITALS
      ) {
        throw new BadRequestException(
          'Only waiting visits can enter preparation',
        );
      }
      const existing = await this.preparationsRepository.findByVisitId(
        createPreparationDto.visitId,
      );
      if (existing) return existing;
    }
    const now = new Date();
    if (createPreparationDto.visitId && this.visitsService && hospitalId) {
      await this.visitsService.transition(
        createPreparationDto.visitId,
        VisitStatus.IN_PREPARATION,
        { id: nurseId, hospitalId } as User,
      );
    }

    const preparationData: Partial<Preparation> = {
      ...createPreparationDto,
      nurseId,
      hospitalId: hospitalId || null,
      status: PreparationStatus.IN_PROGRESS,
      progress: 0,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    return await this.preparationsRepository.create(preparationData);
  }

  /**
   * Get preparation by ID
   */
  async findById(id: string): Promise<Preparation> {
    const preparation = await this.preparationsRepository.findById(id);
    if (!preparation) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }
    return preparation;
  }

  /**
   * Get nurse's active preparations
   */
  async getActivePreparations(nurseId: string): Promise<Preparation[]> {
    return await this.preparationsRepository.findActiveByNurseId(nurseId);
  }

  /**
   * Get all preparations by nurse
   */
  async getByNurse(nurseId: string): Promise<Preparation[]> {
    return await this.preparationsRepository.findByNurseId(nurseId);
  }

  /**
   * Get preparations by patient
   */
  async getByPatient(patientId: string): Promise<Preparation[]> {
    return await this.preparationsRepository.findByPatientId(patientId);
  }

  /**
   * Update preparation progress
   */
  async updateProgress(
    id: string,
    updateProgressDto: UpdatePreparationProgressDto,
    nurseId: string,
  ): Promise<Preparation> {
    const preparation = await this.findById(id);

    // Verify nurse ownership
    if (preparation.nurseId !== nurseId) {
      throw new ForbiddenException(
        'You do not have permission to update this preparation',
      );
    }

    // Auto-update status based on progress
    let status = preparation.status;
    if (updateProgressDto.progress >= 80) {
      status = PreparationStatus.READY;
    }

    const updated = await this.preparationsRepository.update(id, {
      progress: updateProgressDto.progress,
      status,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Update checklist items
   */
  async updateChecklist(
    id: string,
    updateChecklistDto: UpdateChecklistDto,
    nurseId: string,
  ): Promise<Preparation> {
    const preparation = await this.findById(id);

    // Verify nurse ownership
    if (preparation.nurseId !== nurseId) {
      throw new ForbiddenException(
        'You do not have permission to update this preparation',
      );
    }

    const updated = await this.preparationsRepository.update(id, {
      ...updateChecklistDto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Add observations
   */
  async addObservations(
    id: string,
    addObservationsDto: AddObservationsDto,
    nurseId: string,
  ): Promise<Preparation> {
    const preparation = await this.findById(id);

    // Verify nurse ownership
    if (preparation.nurseId !== nurseId) {
      throw new ForbiddenException(
        'You do not have permission to update this preparation',
      );
    }

    const updated = await this.preparationsRepository.update(id, {
      observations: addObservationsDto.observations,
      symptomHistory: addObservationsDto.symptomHistory || preparation.symptomHistory,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Add photo URLs
   */
  async addPhotos(
    id: string,
    photoUrls: string[],
    nurseId: string,
  ): Promise<Preparation> {
    const preparation = await this.findById(id);

    // Verify nurse ownership
    if (preparation.nurseId !== nurseId) {
      throw new ForbiddenException(
        'You do not have permission to update this preparation',
      );
    }

    const existingPhotos = preparation.photoUrls || [];
    const updatedPhotos = [...existingPhotos, ...photoUrls];

    const updated = await this.preparationsRepository.update(id, {
      photoUrls: updatedPhotos,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Mark preparation as complete
   */
  async complete(
    id: string,
    nurseId: string,
    user?: User,
  ): Promise<Preparation> {
    const preparation = await this.findById(id);

    // Verify nurse ownership
    if (preparation.nurseId !== nurseId) {
      throw new ForbiddenException(
        'You do not have permission to update this preparation',
      );
    }

    // Validate progress is at least 80%
    if (preparation.progress < 80) {
      throw new BadRequestException(
        'Preparation must be at least 80% complete before marking as complete',
      );
    }

    const completedAt = new Date();
    const updated = await this.preparationsRepository.update(id, {
      status: PreparationStatus.COMPLETED,
      progress: 100,
      readyAt: completedAt,
      completedAt,
      updatedAt: completedAt,
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
    }

    if (
      updated.visitId &&
      user &&
      this.visitsService &&
      this.visitsRepository
    ) {
      const readyVisit = await this.visitsService.transition(
        updated.visitId,
        VisitStatus.READY,
        user,
      );
      if (!readyVisit.specialtyId) {
        throw new BadRequestException(
          'Select a specialty before completing preparation',
        );
      }
      await this.visitsService.selectSpecialty(
        updated.visitId,
        { specialtyId: readyVisit.specialtyId },
        user,
      );
    }

    return updated;
  }

  /**
   * Get preparation by consultation ID
   */
  async getByConsultation(consultationId: string): Promise<Preparation | null> {
    return await this.preparationsRepository.findByConsultationId(
      consultationId,
    );
  }
}
