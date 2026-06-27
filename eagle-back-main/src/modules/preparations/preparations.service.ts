import {
  Injectable,
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

@Injectable()
export class PreparationsService {
  constructor(
    private readonly preparationsRepository: PreparationsRepository,
  ) {}

  /**
   * Create preparation session
   */
  async create(
    createPreparationDto: CreatePreparationDto,
    nurseId: string,
  ): Promise<Preparation> {
    const preparationData: Partial<Preparation> = {
      ...createPreparationDto,
      nurseId,
      status: PreparationStatus.IN_PROGRESS,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
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
  async complete(id: string, nurseId: string): Promise<Preparation> {
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

    const updated = await this.preparationsRepository.update(id, {
      status: PreparationStatus.COMPLETED,
      readyAt: new Date(),
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Preparation with ID ${id} not found`);
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
