import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { EncryptionService } from 'src/common/services/encryption.service';
import { VitalsProcessingService } from 'src/common/services/vitals-processing.service';
import { Patient } from './entities/patient.entity';
import { UserRole } from '../users/entities/user.entity';
import { VitalSigns } from './entities/vital-signs.interface';

describe('PatientsService - Enhanced Nurse Workflow Methods', () => {
  let service: PatientsService;
  let repository: PatientsRepository;
  let encryptionService: EncryptionService;
  let vitalsProcessingService: VitalsProcessingService;

  const mockPatient: Patient = {
    id: 'patient-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1985-05-15'),
    idNumber: 'ID123456',
    phone: '+237655001234',
    email: 'john.doe@example.com',
    hospitalId: 'hospital-789',
    isActive: true,
    identityVerified: false,
    nurseWorkflowStatus: 'ARRIVED',
    preparationProgress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPatientsRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    findByIdNumber: jest.fn(),
  };

  const mockEncryptionService = {
    encryptPII: jest.fn((data) => `encrypted_${data}`),
    decryptPII: jest.fn((data) => data.replace('encrypted_', '')),
    decryptFields: jest.fn((obj, fields) => obj), // Return object as-is for tests
  };

  const mockVitalsProcessingService = {
    processVitals: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PatientsRepository,
          useValue: mockPatientsRepository,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
        {
          provide: VitalsProcessingService,
          useValue: mockVitalsProcessingService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<PatientsRepository>(PatientsRepository);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    vitalsProcessingService = module.get<VitalsProcessingService>(
      VitalsProcessingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyIdentity', () => {
    const verifyIdentityDto = {
      identityDocumentType: 'CNI' as const,
      identityDocumentUrl: 'https://storage.example.com/cni-123.jpg',
      photoUrl: 'https://storage.example.com/photo-123.jpg',
    };

    beforeEach(() => {
      mockPatientsRepository.findById.mockResolvedValue(mockPatient);
    });

    it('should verify identity for NURSE role', async () => {
      const updatedPatient = {
        ...mockPatient,
        identityVerified: true,
        identityDocumentType: verifyIdentityDto.identityDocumentType,
        identityDocumentUrl: verifyIdentityDto.identityDocumentUrl,
        photoUrl: verifyIdentityDto.photoUrl,
        identityVerifiedBy: 'nurse-456',
        identityVerifiedAt: expect.any(Date),
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.verifyIdentity(
        'patient-123',
        verifyIdentityDto,
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.objectContaining({
          identityVerified: true,
          identityDocumentType: 'CNI',
          identityDocumentUrl: verifyIdentityDto.identityDocumentUrl,
          photoUrl: verifyIdentityDto.photoUrl,
          identityVerifiedBy: 'nurse-456',
          identityVerifiedAt: expect.any(Date),
        }),
      );
      expect(result.identityVerified).toBe(true);
      expect(result.identityVerifiedBy).toBe('nurse-456');
    });

    it('should throw ForbiddenException if user is not a NURSE', async () => {
      await expect(
        service.verifyIdentity(
          'patient-123',
          verifyIdentityDto,
          'doctor-456',
          UserRole.DOCTOR,
          'hospital-789',
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.verifyIdentity(
          'patient-123',
          verifyIdentityDto,
          'doctor-456',
          UserRole.DOCTOR,
          'hospital-789',
        ),
      ).rejects.toThrow('Only nurses can verify patient identity');
    });

    it('should handle PASSPORT document type', async () => {
      const passportDto = {
        ...verifyIdentityDto,
        identityDocumentType: 'PASSPORT' as const,
      };

      const updatedPatient = {
        ...mockPatient,
        identityVerified: true,
        identityDocumentType: 'PASSPORT',
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.verifyIdentity(
        'patient-123',
        passportDto,
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(result.identityDocumentType).toBe('PASSPORT');
    });

    it('should handle OTHER document type', async () => {
      const otherDto = {
        ...verifyIdentityDto,
        identityDocumentType: 'OTHER' as const,
      };

      const updatedPatient = {
        ...mockPatient,
        identityVerified: true,
        identityDocumentType: 'OTHER',
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.verifyIdentity(
        'patient-123',
        otherDto,
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(result.identityDocumentType).toBe('OTHER');
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientsRepository.findById.mockResolvedValue(null);

      await expect(
        service.verifyIdentity(
          'nonexistent',
          verifyIdentityDto,
          'nurse-456',
          UserRole.NURSE,
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      mockPatientsRepository.update.mockResolvedValue(null);

      await expect(
        service.verifyIdentity(
          'patient-123',
          verifyIdentityDto,
          'nurse-456',
          UserRole.NURSE,
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWorkflowStatus', () => {
    beforeEach(() => {
      mockPatientsRepository.findById.mockResolvedValue(mockPatient);
    });

    it('should update workflow status to WAITING', async () => {
      const updatedPatient = {
        ...mockPatient,
        nurseWorkflowStatus: 'WAITING',
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateWorkflowStatus(
        'patient-123',
        'WAITING',
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.objectContaining({
          nurseWorkflowStatus: 'WAITING',
          updatedAt: expect.any(Date),
        }),
      );
      expect(result.nurseWorkflowStatus).toBe('WAITING');
    });

    it('should update to PREPARATION and track nurse', async () => {
      const updatedPatient = {
        ...mockPatient,
        nurseWorkflowStatus: 'PREPARATION',
        preparationNurseId: 'nurse-456',
        preparationProgress: 0,
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateWorkflowStatus(
        'patient-123',
        'PREPARATION',
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.objectContaining({
          nurseWorkflowStatus: 'PREPARATION',
          preparationNurseId: 'nurse-456',
          preparationProgress: 0,
        }),
      );
      expect(result.nurseWorkflowStatus).toBe('PREPARATION');
      expect(result.preparationNurseId).toBe('nurse-456');
      expect(result.preparationProgress).toBe(0);
    });

    it('should update to READY without nurse assignment', async () => {
      const updatedPatient = {
        ...mockPatient,
        nurseWorkflowStatus: 'READY',
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateWorkflowStatus(
        'patient-123',
        'READY',
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.not.objectContaining({
          preparationNurseId: expect.anything(),
        }),
      );
      expect(result.nurseWorkflowStatus).toBe('READY');
    });

    it('should update to IN_CONSULTATION and set progress to 100%', async () => {
      const updatedPatient = {
        ...mockPatient,
        nurseWorkflowStatus: 'IN_CONSULTATION',
        preparationProgress: 100,
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateWorkflowStatus(
        'patient-123',
        'IN_CONSULTATION',
        'nurse-456',
        UserRole.NURSE,
        'hospital-789',
      );

      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.objectContaining({
          nurseWorkflowStatus: 'IN_CONSULTATION',
          preparationProgress: 100,
        }),
      );
      expect(result.nurseWorkflowStatus).toBe('IN_CONSULTATION');
      expect(result.preparationProgress).toBe(100);
    });

    it('should throw ForbiddenException if user is not a NURSE', async () => {
      await expect(
        service.updateWorkflowStatus(
          'patient-123',
          'WAITING',
          'doctor-456',
          UserRole.DOCTOR,
          'hospital-789',
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateWorkflowStatus(
          'patient-123',
          'WAITING',
          'doctor-456',
          UserRole.DOCTOR,
          'hospital-789',
        ),
      ).rejects.toThrow('Only nurses can update workflow status');
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientsRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateWorkflowStatus(
          'nonexistent',
          'WAITING',
          'nurse-456',
          UserRole.NURSE,
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      mockPatientsRepository.update.mockResolvedValue(null);

      await expect(
        service.updateWorkflowStatus(
          'patient-123',
          'WAITING',
          'nurse-456',
          UserRole.NURSE,
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVitalsEnhanced', () => {
    const normalVitals: VitalSigns = {
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      heartRate: 72,
      temperature: 36.8,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      respiratoryRate: 16,
      glycemia: 0.9,
    };

    const processedVitalsWithBMI = {
      ...normalVitals,
      bmi: 22.9,
      alerts: [],
    };

    beforeEach(() => {
      mockPatientsRepository.findById.mockResolvedValue(mockPatient);
    });

    it('should update vitals with BMI calculation (no alerts)', async () => {
      mockVitalsProcessingService.processVitals.mockReturnValue(
        processedVitalsWithBMI,
      );

      const updatedPatient = {
        ...mockPatient,
        vitalSigns: processedVitalsWithBMI,
        vitalSignsUpdatedAt: expect.any(Date),
        vitalSignsUpdatedBy: 'nurse-456',
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateVitalsEnhanced(
        'patient-123',
        { vitalSigns: normalVitals },
        UserRole.NURSE,
        'nurse-456',
        'hospital-789',
      );

      expect(vitalsProcessingService.processVitals).toHaveBeenCalledWith(
        normalVitals,
      );
      expect(repository.update).toHaveBeenCalledWith(
        'patient-123',
        expect.objectContaining({
          vitalSigns: processedVitalsWithBMI,
          vitalSignsUpdatedAt: expect.any(Date),
          vitalSignsUpdatedBy: 'nurse-456',
        }),
      );
      expect(result.patient.vitalSigns).toEqual(processedVitalsWithBMI);
      expect(result.processedVitals.bmi).toBe(22.9);
      expect(result.processedVitals.alerts).toHaveLength(0);
    });

    it('should process vitals with alerts (hypertension)', async () => {
      const hypertensiveVitals: VitalSigns = {
        ...normalVitals,
        bloodPressureSystolic: 165,
        bloodPressureDiastolic: 100,
      };

      const processedWithAlerts = {
        ...hypertensiveVitals,
        bmi: 22.9,
        alerts: [
          {
            type: 'HYPERTENSION_STAGE2',
            severity: 'WARNING',
            message: 'Stage 2 Hypertension (165/100 mmHg)',
          },
        ],
      };

      mockVitalsProcessingService.processVitals.mockReturnValue(
        processedWithAlerts,
      );

      const updatedPatient = {
        ...mockPatient,
        vitalSigns: processedWithAlerts,
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateVitalsEnhanced(
        'patient-123',
        { vitalSigns: hypertensiveVitals },
        UserRole.NURSE,
        'nurse-456',
        'hospital-789',
      );

      expect(result.processedVitals.alerts).toHaveLength(1);
      expect(result.processedVitals.alerts[0].type).toBe('HYPERTENSION_STAGE2');
      expect(result.processedVitals.alerts[0].severity).toBe('WARNING');
    });

    it('should process vitals with multiple alerts', async () => {
      const criticalVitals: VitalSigns = {
        bloodPressureSystolic: 185,
        bloodPressureDiastolic: 115,
        heartRate: 125,
        temperature: 38.5,
        oxygenSaturation: 88,
        weight: 95,
        height: 170,
        respiratoryRate: 25,
        glycemia: 1.5,
      };

      const processedWithMultipleAlerts = {
        ...criticalVitals,
        bmi: 32.9,
        alerts: [
          {
            type: 'HYPERTENSION_CRISIS',
            severity: 'CRITICAL',
            message: 'Hypertensive Crisis',
          },
          {
            type: 'TACHYCARDIA',
            severity: 'WARNING',
            message: 'Elevated Heart Rate',
          },
          {
            type: 'FEVER',
            severity: 'INFO',
            message: 'Fever',
          },
          {
            type: 'HYPOXEMIA',
            severity: 'WARNING',
            message: 'Low Oxygen',
          },
          {
            type: 'OBESITY',
            severity: 'WARNING',
            message: 'Obese',
          },
        ],
      };

      mockVitalsProcessingService.processVitals.mockReturnValue(
        processedWithMultipleAlerts,
      );

      const updatedPatient = {
        ...mockPatient,
        vitalSigns: processedWithMultipleAlerts,
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateVitalsEnhanced(
        'patient-123',
        { vitalSigns: criticalVitals },
        UserRole.NURSE,
        'nurse-456',
        'hospital-789',
      );

      expect(result.processedVitals.alerts.length).toBeGreaterThan(3);
      expect(result.processedVitals.bmi).toBe(32.9);
      
      const alertTypes = result.processedVitals.alerts.map((a: any) => a.type);
      expect(alertTypes).toContain('HYPERTENSION_CRISIS');
      expect(alertTypes).toContain('TACHYCARDIA');
    });

    it('should throw ForbiddenException if user is not a NURSE', async () => {
      await expect(
        service.updateVitalsEnhanced(
          'patient-123',
          { vitalSigns: normalVitals },
          UserRole.DOCTOR,
          'doctor-456',
          'hospital-789',
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateVitalsEnhanced(
          'patient-123',
          { vitalSigns: normalVitals },
          UserRole.DOCTOR,
          'doctor-456',
          'hospital-789',
        ),
      ).rejects.toThrow('Only nurses can update vital signs');
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientsRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateVitalsEnhanced(
          'nonexistent',
          { vitalSigns: normalVitals },
          UserRole.NURSE,
          'nurse-456',
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      mockVitalsProcessingService.processVitals.mockReturnValue(
        processedVitalsWithBMI,
      );
      mockPatientsRepository.update.mockResolvedValue(null);

      await expect(
        service.updateVitalsEnhanced(
          'patient-123',
          { vitalSigns: normalVitals },
          UserRole.NURSE,
          'nurse-456',
          'hospital-789',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle vitals without optional fields', async () => {
      const minimalVitals: VitalSigns = {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 75,
        temperature: 37.0,
        oxygenSaturation: 98,
        weight: 70,
        height: 175,
      };

      const processedMinimal = {
        ...minimalVitals,
        bmi: 22.9,
        alerts: [],
      };

      mockVitalsProcessingService.processVitals.mockReturnValue(
        processedMinimal,
      );

      const updatedPatient = {
        ...mockPatient,
        vitalSigns: processedMinimal,
      };

      mockPatientsRepository.update.mockResolvedValue(updatedPatient);

      const result = await service.updateVitalsEnhanced(
        'patient-123',
        { vitalSigns: minimalVitals },
        UserRole.NURSE,
        'nurse-456',
        'hospital-789',
      );

      expect(result.processedVitals.bmi).toBe(22.9);
      expect(result.processedVitals.respiratoryRate).toBeUndefined();
      expect(result.processedVitals.glycemia).toBeUndefined();
    });
  });
});
