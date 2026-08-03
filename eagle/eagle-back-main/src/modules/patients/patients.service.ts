import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PatientsRepository } from './patients.repository';
import {
  CreatePatientDto,
  UpdatePatientDto,
  UpdateVitalsDto,
  UpdateEhrDto,
} from './dto';
import { Patient } from './entities/patient.entity';
import { UserRole } from '../users/entities/user.entity';
import { EncryptionService } from '../../common/services/encryption.service';
import { VitalsProcessingService } from '../../common/services/vitals-processing.service';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly patientsRepository: PatientsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly vitalsProcessingService: VitalsProcessingService,
  ) {}

  /**
   * Create patient (SECONDARY_SECRETARY only)
   */
  async create(
    createPatientDto: CreatePatientDto,
    hospitalId: string,
    registeredBy?: string,
    registeredByRole?: UserRole,
  ): Promise<Patient> {
    // Check uniqueness of idNumber
    const existingPatient = await this.patientsRepository.findByIdNumber(
      createPatientDto.idNumber,
    );

    if (existingPatient) {
      throw new ConflictException(
        `Patient with ID number ${createPatientDto.idNumber} already exists`,
      );
    }

    const patientData: Partial<Patient> = {
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
      hospitalId,
      registeredBy: registeredBy || null,
      registeredByRole: registeredByRole || null,
      diabetic: createPatientDto.diabetic ?? false,
      hasDrugAllergies: createPatientDto.hasDrugAllergies ?? false,
      allergyDetails: createPatientDto.allergyDetails
        ? this.encryptionService.encrypt(createPatientDto.allergyDetails)
        : null,
      chronicConditions: createPatientDto.chronicConditions
        ? this.encryptionService.encrypt(createPatientDto.chronicConditions)
        : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const patient = await this.patientsRepository.create(patientData);
    this.logger.log(
      `Patient created: id=${patient.id} name=${patient.firstName} ${patient.lastName} hospitalId=${hospitalId}`,
    );
    return this.encryptionService.decryptFields(patient, [
      'allergyDetails',
      'chronicConditions',
    ]);
  }

  /**
   * Get all patients (with access control)
   */
  async findAll(
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient[]> {
    let patients: Patient[];

    // SECONDARY_SECRETARY can only see patients from their own hospital
    if (
      userRole === UserRole.SECONDARY_SECRETARY ||
      userRole === UserRole.NURSE
    ) {
      if (!userHospitalId) {
        return [];
      }
      patients = await this.patientsRepository.findActiveByHospital(userHospitalId);
    } else {
      // ADMIN, PRIMARY_SECRETARY, DOCTOR can see all patients
      patients = await this.patientsRepository.findAll();
    }

    // Decrypt sensitive EHR fields for all patients
    return patients.map((patient) =>
      this.encryptionService.decryptFields(patient, [
        'medicalHistory',
        'allergies',
        'currentMedications',
        'allergyDetails',
        'chronicConditions',
      ]),
    );
  }

  /**
   * Get patient by ID (with access control)
   */
  async findById(
    id: string,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    const patient = await this.patientsRepository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Access control
    if (
      userRole === UserRole.SECONDARY_SECRETARY ||
      userRole === UserRole.NURSE
    ) {
      if (patient.hospitalId !== userHospitalId) {
        throw new ForbiddenException(
          'You do not have permission to view this patient',
        );
      }
    }

    // NURSE can view if patient is from their hospital
    if (
      userRole === UserRole.NURSE &&
      userHospitalId &&
      patient.hospitalId !== userHospitalId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this patient',
      );
    }

    // DOCTOR can view patients (they may be consulting on patients from different hospitals)
    // Access control for doctors is handled at the endpoint level (e.g., EHR updates)

    // Decrypt sensitive EHR fields
    const decryptedPatient = this.encryptionService.decryptFields(
      patient,
      [
        'medicalHistory',
        'allergies',
        'currentMedications',
        'allergyDetails',
        'chronicConditions',
      ],
    );

    return decryptedPatient;
  }

  /**
   * Search patients (with access control)
   */
  async search(
    query: string,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient[]> {
    let patients: Patient[];

    // SECONDARY_SECRETARY can only search within their own hospital
    if (
      userRole === UserRole.SECONDARY_SECRETARY ||
      userRole === UserRole.NURSE
    ) {
      if (!userHospitalId) {
        return [];
      }
      patients = await this.patientsRepository.search(query, userHospitalId);
    } else {
      // ADMIN, PRIMARY_SECRETARY, DOCTOR can search all patients
      patients = await this.patientsRepository.search(query);
    }

    // Decrypt sensitive EHR fields
    return patients.map((patient) =>
      this.encryptionService.decryptFields(patient, [
        'medicalHistory',
        'allergies',
        'currentMedications',
        'allergyDetails',
        'chronicConditions',
      ]),
    );
  }

  /**
   * Update patient (with access control)
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    const patient = await this.findById(id, userRole, userHospitalId);

    // Check idNumber uniqueness if being updated
    if (updatePatientDto.idNumber && updatePatientDto.idNumber !== patient.idNumber) {
      const existingPatient = await this.patientsRepository.findByIdNumber(
        updatePatientDto.idNumber,
      );

      if (existingPatient && existingPatient.id !== id) {
        throw new ConflictException(
          `Patient with ID number ${updatePatientDto.idNumber} already exists`,
        );
      }
    }

    // Access control for updates
    if (userRole === UserRole.SECONDARY_SECRETARY) {
      if (patient.hospitalId !== userHospitalId) {
        throw new ForbiddenException(
          'You do not have permission to update this patient',
        );
      }
    }

    // Exclude dateOfBirth from spread since it needs conversion from string to Date
    const { dateOfBirth, ...restDto } = updatePatientDto;
    const updateData: Partial<Patient> = {
      ...restDto,
      updatedAt: new Date(),
    };

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    const updated = await this.patientsRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Deactivate patient (Admin or Primary Secretary)
   */
  async deactivate(
    id: string,
    userRole: UserRole,
  ): Promise<Patient> {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.PRIMARY_SECRETARY) {
      throw new ForbiddenException(
        'Only ADMIN or PRIMARY_SECRETARY can deactivate patients',
      );
    }

    const patient = await this.patientsRepository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const updated = await this.patientsRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Update patient vital signs (NURSE only)
   */
  async updateVitals(
    id: string,
    updateVitalsDto: UpdateVitalsDto,
    userRole: UserRole,
    userId: string,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    if (userRole !== UserRole.NURSE) {
      throw new ForbiddenException('Only nurses can update vital signs');
    }

    const patient = await this.findById(id, userRole, userHospitalId);

    const updated = await this.patientsRepository.update(id, {
      vitalSigns: updateVitalsDto.vitalSigns,
      vitalSignsUpdatedAt: new Date(),
      vitalSignsUpdatedBy: userId,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Update patient EHR (Electronic Health Record)
   * Access: NURSE, DOCTOR, SECONDARY_SECRETARY (own hospital)
   */
  async updateEhr(
    id: string,
    updateEhrDto: UpdateEhrDto,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    const patient = await this.findById(id, userRole, userHospitalId);

    // Prepare update data with encryption for sensitive fields
    const updateData: Partial<Patient> = {
      ...updateEhrDto,
      updatedAt: new Date(),
    };

    // Encrypt sensitive EHR fields before saving
    if (updateData.medicalHistory) {
      updateData.medicalHistory = this.encryptionService.encrypt(
        updateData.medicalHistory,
      );
    }
    if (updateData.allergies) {
      updateData.allergies = this.encryptionService.encrypt(
        updateData.allergies,
      );
    }
    if (updateData.currentMedications) {
      updateData.currentMedications = this.encryptionService.encrypt(
        updateData.currentMedications,
      );
    }

    const updated = await this.patientsRepository.update(id, updateData);

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Decrypt before returning
    return this.encryptionService.decryptFields(updated, [
      'medicalHistory',
      'allergies',
      'currentMedications',
    ]);
  }

  /**
   * Verify patient identity (NURSE only)
   */
  async verifyIdentity(
    id: string,
    verifyIdentityDto: any,
    nurseId: string,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    if (userRole !== UserRole.NURSE) {
      throw new ForbiddenException('Only nurses can verify patient identity');
    }

    const patient = await this.findById(id, userRole, userHospitalId);

    const updated = await this.patientsRepository.update(id, {
      identityVerified: true,
      identityVerifiedAt: new Date(),
      identityVerifiedBy: nurseId,
      identityDocumentType: verifyIdentityDto.identityDocumentType,
      identityDocumentUrl: verifyIdentityDto.identityDocumentUrl || patient.identityDocumentUrl,
      photoUrl: verifyIdentityDto.photoUrl || patient.photoUrl,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Update patient workflow status (NURSE only)
   */
  async updateWorkflowStatus(
    id: string,
    status: string,
    nurseId: string,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Patient> {
    if (userRole !== UserRole.NURSE) {
      throw new ForbiddenException('Only nurses can update workflow status');
    }

    const patient = await this.findById(id, userRole, userHospitalId);

    const updateData: Partial<Patient> = {
      nurseWorkflowStatus: status as any,
      updatedAt: new Date(),
    };

    // If moving to PREPARATION, track the nurse
    if (status === 'PREPARATION') {
      updateData.preparationNurseId = nurseId;
      updateData.preparationProgress = 0;
    }

    // If moving to IN_CONSULTATION, mark as ready
    if (status === 'IN_CONSULTATION') {
      updateData.preparationProgress = 100;
    }

    const updated = await this.patientsRepository.update(id, updateData);

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Update vitals with enhanced processing (BMI + alerts)
   */
  async updateVitalsEnhanced(
    id: string,
    updateVitalsDto: any,
    userRole: UserRole,
    userId: string,
    userHospitalId?: string | null,
  ): Promise<{ patient: Patient; processedVitals: any }> {
    if (userRole !== UserRole.NURSE) {
      throw new ForbiddenException('Only nurses can update vital signs');
    }

    const patient = await this.findById(id, userRole, userHospitalId);

    // Process vitals (calculate BMI and generate alerts)
    const processedVitals = this.vitalsProcessingService.processVitals(
      updateVitalsDto.vitalSigns,
    );

    const updated = await this.patientsRepository.update(id, {
      vitalSigns: processedVitals,
      vitalSignsUpdatedAt: new Date(),
      vitalSignsUpdatedBy: userId,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return {
      patient: updated,
      processedVitals,
    };
  }
}
