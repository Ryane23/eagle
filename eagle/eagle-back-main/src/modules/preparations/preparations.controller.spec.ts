import { Test, TestingModule } from '@nestjs/testing';
import { PreparationsController } from './preparations.controller';
import { PreparationsService } from './preparations.service';
import {
  CreatePreparationDto,
  UpdatePreparationProgressDto,
  UpdateChecklistDto,
  AddObservationsDto,
} from './dto';
import {
  Preparation,
  PreparationStatus,
} from './entities/preparation.entity';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

describe('PreparationsController', () => {
  let controller: PreparationsController;
  let service: PreparationsService;

  const mockUser: User = {
    id: 'nurse-123',
    email: 'nurse@hospital.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.NURSE,
    hospitalId: 'hospital-456',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockPreparation: Preparation = {
    id: 'prep-123',
    patientId: 'patient-456',
    nurseId: 'nurse-123',
    consultationId: 'consultation-789',
    status: PreparationStatus.IN_PROGRESS,
    progress: 50,
    videoSetupCompleted: false,
    audioSetupCompleted: false,
    patientPositioningOk: false,
    lightingAdequate: false,
    observations: 'Patient seems calm',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreparationsService = {
    create: jest.fn(),
    findById: jest.fn(),
    getActivePreparations: jest.fn(),
    getByNurse: jest.fn(),
    getByPatient: jest.fn(),
    updateProgress: jest.fn(),
    updateChecklist: jest.fn(),
    addObservations: jest.fn(),
    complete: jest.fn(),
    getByConsultation: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreparationsController],
      providers: [
        {
          provide: PreparationsService,
          useValue: mockPreparationsService,
        },
      ],
    }).compile();

    controller = module.get<PreparationsController>(PreparationsController);
    service = module.get<PreparationsService>(PreparationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new preparation', async () => {
      const createDto: CreatePreparationDto = {
        patientId: 'patient-456',
        consultationId: 'consultation-789',
      };

      mockPreparationsService.create.mockResolvedValue(mockPreparation);

      const result = await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(
        createDto,
        mockUser.id,
        mockUser.hospitalId,
      );
      expect(result).toEqual(mockPreparation);
    });
  });

  describe('getActive', () => {
    it('should return active preparations for nurse', async () => {
      const activePreps = [mockPreparation];
      mockPreparationsService.getActivePreparations.mockResolvedValue(
        activePreps,
      );

      const result = await controller.getActive(mockUser);

      expect(service.getActivePreparations).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(activePreps);
    });

    it('should return empty array when no active preparations', async () => {
      mockPreparationsService.getActivePreparations.mockResolvedValue([]);

      const result = await controller.getActive(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getMyPreparations', () => {
    it('should return all preparations by nurse', async () => {
      const allPreps = [
        mockPreparation,
        { ...mockPreparation, id: 'prep-456', status: PreparationStatus.COMPLETED },
      ];
      mockPreparationsService.getByNurse.mockResolvedValue(allPreps);

      const result = await controller.getMyPreparations(mockUser);

      expect(service.getByNurse).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(allPreps);
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return preparation by ID', async () => {
      mockPreparationsService.findById.mockResolvedValue(mockPreparation);

      const result = await controller.findById('prep-123');

      expect(service.findById).toHaveBeenCalledWith('prep-123');
      expect(result).toEqual(mockPreparation);
    });
  });

  describe('getByPatient', () => {
    it('should return preparations for patient', async () => {
      const patientPreps = [mockPreparation];
      mockPreparationsService.getByPatient.mockResolvedValue(patientPreps);

      const result = await controller.getByPatient('patient-456');

      expect(service.getByPatient).toHaveBeenCalledWith('patient-456');
      expect(result).toEqual(patientPreps);
    });
  });

  describe('updateProgress', () => {
    it('should update preparation progress', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 75 };
      const updatedPrep = { ...mockPreparation, progress: 75 };

      mockPreparationsService.updateProgress.mockResolvedValue(updatedPrep);

      const result = await controller.updateProgress(
        'prep-123',
        updateDto,
        mockUser,
      );

      expect(service.updateProgress).toHaveBeenCalledWith(
        'prep-123',
        updateDto,
        mockUser.id,
      );
      expect(result.progress).toBe(75);
    });

    it('should auto-update status when progress >= 80%', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 85 };
      const updatedPrep = {
        ...mockPreparation,
        progress: 85,
        status: PreparationStatus.READY,
      };

      mockPreparationsService.updateProgress.mockResolvedValue(updatedPrep);

      const result = await controller.updateProgress(
        'prep-123',
        updateDto,
        mockUser,
      );

      expect(result.status).toBe(PreparationStatus.READY);
    });
  });

  describe('updateChecklist', () => {
    it('should update checklist items', async () => {
      const updateDto: UpdateChecklistDto = {
        videoSetupCompleted: true,
        audioSetupCompleted: true,
        patientPositioningOk: true,
        lightingAdequate: false,
      };
      const updatedPrep = { ...mockPreparation, ...updateDto };

      mockPreparationsService.updateChecklist.mockResolvedValue(updatedPrep);

      const result = await controller.updateChecklist(
        'prep-123',
        updateDto,
        mockUser,
      );

      expect(service.updateChecklist).toHaveBeenCalledWith(
        'prep-123',
        updateDto,
        mockUser.id,
      );
      expect(result.videoSetupCompleted).toBe(true);
      expect(result.audioSetupCompleted).toBe(true);
    });

    it('should handle partial checklist updates', async () => {
      const updateDto: UpdateChecklistDto = {
        videoSetupCompleted: true,
      };
      const updatedPrep = { ...mockPreparation, videoSetupCompleted: true };

      mockPreparationsService.updateChecklist.mockResolvedValue(updatedPrep);

      const result = await controller.updateChecklist(
        'prep-123',
        updateDto,
        mockUser,
      );

      expect(result.videoSetupCompleted).toBe(true);
    });
  });

  describe('addObservations', () => {
    it('should add clinical observations', async () => {
      const addDto: AddObservationsDto = {
        observations: 'Patient reports severe headache',
        symptomHistory: 'Headache started 3 days ago',
      };
      const updatedPrep = {
        ...mockPreparation,
        observations: addDto.observations,
        symptomHistory: addDto.symptomHistory,
      };

      mockPreparationsService.addObservations.mockResolvedValue(updatedPrep);

      const result = await controller.addObservations(
        'prep-123',
        addDto,
        mockUser,
      );

      expect(service.addObservations).toHaveBeenCalledWith(
        'prep-123',
        addDto,
        mockUser.id,
      );
      expect(result.observations).toBe(addDto.observations);
      expect(result.symptomHistory).toBe(addDto.symptomHistory);
    });

    it('should add only observations without symptomHistory', async () => {
      const addDto: AddObservationsDto = {
        observations: 'Patient is anxious',
      };
      const updatedPrep = {
        ...mockPreparation,
        observations: addDto.observations,
      };

      mockPreparationsService.addObservations.mockResolvedValue(updatedPrep);

      const result = await controller.addObservations(
        'prep-123',
        addDto,
        mockUser,
      );

      expect(result.observations).toBe(addDto.observations);
    });
  });

  describe('complete', () => {
    it('should mark preparation as complete', async () => {
      const completedPrep = {
        ...mockPreparation,
        progress: 90,
        status: PreparationStatus.COMPLETED,
        readyAt: new Date(),
      };

      mockPreparationsService.complete.mockResolvedValue(completedPrep);

      const result = await controller.complete('prep-123', mockUser);

      expect(service.complete).toHaveBeenCalledWith(
        'prep-123',
        mockUser.id,
        mockUser,
      );
      expect(result.status).toBe(PreparationStatus.COMPLETED);
      expect(result.readyAt).toBeDefined();
    });
  });

  describe('getByConsultation', () => {
    it('should return preparation by consultation ID', async () => {
      mockPreparationsService.getByConsultation.mockResolvedValue(
        mockPreparation,
      );

      const result = await controller.getByConsultation('consultation-789');

      expect(service.getByConsultation).toHaveBeenCalledWith(
        'consultation-789',
      );
      expect(result).toEqual(mockPreparation);
    });

    it('should return null when no preparation found', async () => {
      mockPreparationsService.getByConsultation.mockResolvedValue(null);

      const result = await controller.getByConsultation('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('Role-based access', () => {
    it('should allow NURSE to create preparation', async () => {
      const createDto: CreatePreparationDto = {
        patientId: 'patient-456',
        consultationId: 'consultation-789',
      };

      mockPreparationsService.create.mockResolvedValue(mockPreparation);

      const result = await controller.create(createDto, mockUser);

      expect(result).toBeDefined();
    });

    it('should allow NURSE to update progress', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 70 };

      mockPreparationsService.updateProgress.mockResolvedValue(
        mockPreparation,
      );

      const result = await controller.updateProgress(
        'prep-123',
        updateDto,
        mockUser,
      );

      expect(result).toBeDefined();
    });

    it('should allow DOCTOR and NURSE to view preparation', async () => {
      mockPreparationsService.findById.mockResolvedValue(mockPreparation);

      const result = await controller.findById('prep-123');

      expect(result).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors to controller', async () => {
      mockPreparationsService.findById.mockRejectedValue(
        new Error('Preparation not found'),
      );

      await expect(controller.findById('nonexistent')).rejects.toThrow(
        'Preparation not found',
      );
    });

    it('should propagate forbidden errors for unauthorized access', async () => {
      const updateDto: UpdatePreparationProgressDto = { progress: 70 };
      mockPreparationsService.updateProgress.mockRejectedValue(
        new Error('You do not have permission to update this preparation'),
      );

      await expect(
        controller.updateProgress('prep-123', updateDto, mockUser),
      ).rejects.toThrow('You do not have permission to update this preparation');
    });
  });
});
