import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PreparationsService } from './preparations.service';
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

describe('PreparationsService', () => {
  let service: PreparationsService;
  let repository: PreparationsRepository;

  const mockPreparationsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findActiveByNurseId: jest.fn(),
    findByNurseId: jest.fn(),
    findByPatientId: jest.fn(),
    update: jest.fn(),
    findByConsultationId: jest.fn(),
  };

  const mockPreparation: Preparation = {
    id: 'prep-123',
    patientId: 'patient-456',
    nurseId: 'nurse-789',
    consultationId: 'consultation-101',
    status: PreparationStatus.IN_PROGRESS,
    progress: 50,
    videoSetupCompleted: false,
    audioSetupCompleted: false,
    patientPositioningOk: false,
    lightingAdequate: false,
    observations: 'Patient seems anxious',
    symptomHistory: 'Headache for 2 days',
    psychologicalState: 'anxious',
    anxietyLevel: 6,
    createdAt: new Date('2026-01-23T10:00:00Z'),
    updatedAt: new Date('2026-01-23T10:30:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreparationsService,
        {
          provide: PreparationsRepository,
          useValue: mockPreparationsRepository,
        },
      ],
    }).compile();

    service = module.get<PreparationsService>(PreparationsService);
    repository = module.get<PreparationsRepository>(PreparationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new preparation with default status IN_PROGRESS', async () => {
      const createDto: CreatePreparationDto = {
        patientId: 'patient-456',
        consultationId: 'consultation-101',
      };
      const nurseId = 'nurse-789';

      mockPreparationsRepository.create.mockResolvedValue({
        ...mockPreparation,
        id: 'new-prep-id',
        status: PreparationStatus.IN_PROGRESS,
        progress: 0,
      });

      const result = await service.create(createDto, nurseId);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: createDto.patientId,
          consultationId: createDto.consultationId,
          nurseId,
          status: PreparationStatus.IN_PROGRESS,
          progress: 0,
        }),
      );
      expect(result.nurseId).toBe(nurseId);
      expect(result.status).toBe(PreparationStatus.IN_PROGRESS);
    });
  });

  describe('findById', () => {
    it('should return preparation when found', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);

      const result = await service.findById('prep-123');

      expect(repository.findById).toHaveBeenCalledWith('prep-123');
      expect(result).toEqual(mockPreparation);
    });

    it('should throw NotFoundException when preparation not found', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById('nonexistent')).rejects.toThrow(
        'Preparation with ID nonexistent not found',
      );
    });
  });

  describe('getActivePreparations', () => {
    it('should return active preparations for nurse', async () => {
      const activePreps = [
        mockPreparation,
        { ...mockPreparation, id: 'prep-456' },
      ];
      mockPreparationsRepository.findActiveByNurseId.mockResolvedValue(
        activePreps,
      );

      const result = await service.getActivePreparations('nurse-789');

      expect(repository.findActiveByNurseId).toHaveBeenCalledWith('nurse-789');
      expect(result).toEqual(activePreps);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no active preparations', async () => {
      mockPreparationsRepository.findActiveByNurseId.mockResolvedValue([]);

      const result = await service.getActivePreparations('nurse-789');

      expect(result).toEqual([]);
    });
  });

  describe('getByNurse', () => {
    it('should return all preparations for nurse', async () => {
      const allPreps = [
        mockPreparation,
        { ...mockPreparation, id: 'prep-456', status: PreparationStatus.COMPLETED },
      ];
      mockPreparationsRepository.findByNurseId.mockResolvedValue(allPreps);

      const result = await service.getByNurse('nurse-789');

      expect(repository.findByNurseId).toHaveBeenCalledWith('nurse-789');
      expect(result).toEqual(allPreps);
    });
  });

  describe('getByPatient', () => {
    it('should return all preparations for patient', async () => {
      const patientPreps = [mockPreparation];
      mockPreparationsRepository.findByPatientId.mockResolvedValue(
        patientPreps,
      );

      const result = await service.getByPatient('patient-456');

      expect(repository.findByPatientId).toHaveBeenCalledWith('patient-456');
      expect(result).toEqual(patientPreps);
    });
  });

  describe('updateProgress', () => {
    it('should update progress without changing status (< 80%)', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 60 };
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        progress: 60,
      });

      const result = await service.updateProgress(
        'prep-123',
        updateDto,
        'nurse-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          progress: 60,
          status: PreparationStatus.IN_PROGRESS,
        }),
      );
      expect(result.progress).toBe(60);
    });

    it('should auto-update status to READY when progress >= 80%', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 85 };
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        progress: 85,
        status: PreparationStatus.READY,
      });

      const result = await service.updateProgress(
        'prep-123',
        updateDto,
        'nurse-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          progress: 85,
          status: PreparationStatus.READY,
        }),
      );
      expect(result.status).toBe(PreparationStatus.READY);
    });

    it('should throw ForbiddenException if nurse does not own preparation', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);

      await expect(
        service.updateProgress('prep-123', { progress: 70 }, 'different-nurse'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateProgress('prep-123', { progress: 70 }, 'different-nurse'),
      ).rejects.toThrow('You do not have permission to update this preparation');
    });

    it('should throw NotFoundException if preparation not found after update', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue(null);

      await expect(
        service.updateProgress('prep-123', { progress: 70 }, 'nurse-789'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateChecklist', () => {
    it('should update checklist items successfully', async () => {
      const updateDto: UpdateChecklistDto = {
        videoSetupCompleted: true,
        audioSetupCompleted: true,
        patientPositioningOk: true,
        lightingAdequate: false,
      };
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        ...updateDto,
      });

      const result = await service.updateChecklist(
        'prep-123',
        updateDto,
        'nurse-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining(updateDto),
      );
      expect(result.videoSetupCompleted).toBe(true);
      expect(result.audioSetupCompleted).toBe(true);
    });

    it('should throw ForbiddenException if nurse does not own preparation', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);

      await expect(
        service.updateChecklist(
          'prep-123',
          { videoSetupCompleted: true },
          'different-nurse',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addObservations', () => {
    it('should add observations successfully', async () => {
      const addDto: AddObservationsDto = {
        observations: 'Patient is calm now',
        symptomHistory: 'Headache persists',
      };
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        observations: addDto.observations,
        symptomHistory: addDto.symptomHistory,
      });

      const result = await service.addObservations(
        'prep-123',
        addDto,
        'nurse-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          observations: addDto.observations,
          symptomHistory: addDto.symptomHistory,
        }),
      );
      expect(result.observations).toBe('Patient is calm now');
    });

    it('should preserve existing symptomHistory if not provided', async () => {
      const addDto: AddObservationsDto = {
        observations: 'Updated observations',
      };
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        observations: addDto.observations,
      });

      await service.addObservations('prep-123', addDto, 'nurse-789');

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          observations: addDto.observations,
          symptomHistory: mockPreparation.symptomHistory,
        }),
      );
    });

    it('should throw ForbiddenException if nurse does not own preparation', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);

      await expect(
        service.addObservations(
          'prep-123',
          { observations: 'test' },
          'different-nurse',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addPhotos', () => {
    it('should add photo URLs to existing photos', async () => {
      const existingPrep = {
        ...mockPreparation,
        photoUrls: ['https://example.com/photo1.jpg'],
      };
      const newPhotos = [
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ];

      mockPreparationsRepository.findById.mockResolvedValue(existingPrep);
      mockPreparationsRepository.update.mockResolvedValue({
        ...existingPrep,
        photoUrls: [...existingPrep.photoUrls, ...newPhotos],
      });

      const result = await service.addPhotos('prep-123', newPhotos, 'nurse-789');

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          photoUrls: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
            'https://example.com/photo3.jpg',
          ],
        }),
      );
      expect(result.photoUrls).toHaveLength(3);
    });

    it('should handle preparation with no existing photos', async () => {
      const newPhotos = ['https://example.com/photo1.jpg'];

      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);
      mockPreparationsRepository.update.mockResolvedValue({
        ...mockPreparation,
        photoUrls: newPhotos,
      });

      const result = await service.addPhotos('prep-123', newPhotos, 'nurse-789');

      expect(result.photoUrls).toEqual(newPhotos);
    });

    it('should throw ForbiddenException if nurse does not own preparation', async () => {
      mockPreparationsRepository.findById.mockResolvedValue(mockPreparation);

      await expect(
        service.addPhotos('prep-123', ['photo.jpg'], 'different-nurse'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('complete', () => {
    it('should mark preparation as COMPLETED when progress >= 80%', async () => {
      const readyPrep = { ...mockPreparation, progress: 85 };
      mockPreparationsRepository.findById.mockResolvedValue(readyPrep);
      mockPreparationsRepository.update.mockResolvedValue({
        ...readyPrep,
        status: PreparationStatus.COMPLETED,
        readyAt: expect.any(Date),
      });

      const result = await service.complete('prep-123', 'nurse-789');

      expect(repository.update).toHaveBeenCalledWith(
        'prep-123',
        expect.objectContaining({
          status: PreparationStatus.COMPLETED,
          readyAt: expect.any(Date),
        }),
      );
      expect(result.status).toBe(PreparationStatus.COMPLETED);
    });

    it('should throw BadRequestException when progress < 80%', async () => {
      const incompletePre = { ...mockPreparation, progress: 70 };
      mockPreparationsRepository.findById.mockResolvedValue(incompletePre);

      await expect(
        service.complete('prep-123', 'nurse-789'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete('prep-123', 'nurse-789'),
      ).rejects.toThrow(
        'Preparation must be at least 80% complete before marking as complete',
      );
    });

    it('should throw ForbiddenException if nurse does not own preparation', async () => {
      const readyPrep = { ...mockPreparation, progress: 90 };
      mockPreparationsRepository.findById.mockResolvedValue(readyPrep);

      await expect(
        service.complete('prep-123', 'different-nurse'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if preparation not found after update', async () => {
      const readyPrep = { ...mockPreparation, progress: 90 };
      mockPreparationsRepository.findById.mockResolvedValue(readyPrep);
      mockPreparationsRepository.update.mockResolvedValue(null);

      await expect(
        service.complete('prep-123', 'nurse-789'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByConsultation', () => {
    it('should return preparation for consultation', async () => {
      mockPreparationsRepository.findByConsultationId.mockResolvedValue(
        mockPreparation,
      );

      const result = await service.getByConsultation('consultation-101');

      expect(repository.findByConsultationId).toHaveBeenCalledWith(
        'consultation-101',
      );
      expect(result).toEqual(mockPreparation);
    });

    it('should return null when no preparation found for consultation', async () => {
      mockPreparationsRepository.findByConsultationId.mockResolvedValue(null);

      const result = await service.getByConsultation('nonexistent-consultation');

      expect(result).toBeNull();
    });
  });
});
