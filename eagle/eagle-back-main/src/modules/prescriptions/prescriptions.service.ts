import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrescriptionsRepository } from './prescriptions.repository';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';
import { Prescription, Medication } from './entities/prescription.entity';
import { UserRole } from '../users/entities/user.entity';
import { FirebaseService } from '../../config/firebase';
import { UserCollection } from '../users/entities/user.entity';
import { PatientCollection } from '../patients/entities/patient.entity';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prescriptionsRepository: PrescriptionsRepository,
    private readonly firebaseService: FirebaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create prescription (DOCTOR only)
   */
  async create(
    createPrescriptionDto: CreatePrescriptionDto,
    doctorId: string,
  ): Promise<Prescription> {
    const { consultationId, patientId, medications, instructions, notes } =
      createPrescriptionDto;

    // Verify consultation exists and doctor is assigned to it
    const consultationDoc = await this.firebaseService
      .collection(ConsultationCollection)
      .doc(consultationId)
      .get();

    if (!consultationDoc.exists) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    const consultationData = consultationDoc.data();
    if (consultationData?.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You are not assigned to this consultation',
      );
    }

    // Verify patient exists
    const patientDoc = await this.firebaseService
      .collection(PatientCollection)
      .doc(patientId)
      .get();

    if (!patientDoc.exists) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Verify consultation patient matches
    if (consultationData?.patientId !== patientId) {
      throw new BadRequestException(
        'Patient ID does not match consultation patient',
      );
    }

    // Create prescription
    const prescriptionData: Partial<Prescription> = {
      consultationId,
      patientId,
      doctorId,
      medications: medications as Medication[],
      instructions: instructions || null,
      notes: notes || null,
      isDispensed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prescription = await this.prescriptionsRepository.create(prescriptionData);

    // Emit event
    this.eventEmitter.emit('prescription.created', {
      prescriptionId: prescription.id,
      consultationId,
      patientId,
      doctorId,
    });

    return prescription;
  }

  /**
   * Get all prescriptions with role-based filtering
   */
  async findAll(
    userRole: UserRole,
    userId?: string,
    userHospitalId?: string | null,
  ): Promise<Prescription[]> {
    // DOCTOR: See their own prescriptions
    if (userRole === UserRole.DOCTOR && userId) {
      return await this.prescriptionsRepository.findByDoctorId(userId);
    }

    // NURSE: See prescriptions for their hospital's patients
    if (userRole === UserRole.NURSE && userHospitalId) {
      return await this.findByHospital(userHospitalId);
    }

    // ADMIN, PRIMARY_SECRETARY: See all prescriptions
    return await this.prescriptionsRepository.findAll();
  }

  /**
   * Find prescriptions by hospital (through patient's hospital)
   */
  private async findByHospital(hospitalId: string): Promise<Prescription[]> {
    // Get all patients from this hospital
    const patientsSnapshot = await this.firebaseService
      .collection(PatientCollection)
      .where('hospitalId', '==', hospitalId)
      .get();

    const patientIds = patientsSnapshot.docs.map((doc) => doc.id);

    if (patientIds.length === 0) {
      return [];
    }

    // Get all prescriptions for these patients
    const allPrescriptions =
      await this.prescriptionsRepository.findAll();

    return allPrescriptions.filter((prescription) =>
      patientIds.includes(prescription.patientId),
    );
  }

  /**
   * Get prescription by ID with access control
   */
  async findById(
    id: string,
    userRole: UserRole,
    userId?: string,
    userHospitalId?: string | null,
  ): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Access control
    if (userRole === UserRole.DOCTOR && prescription.doctorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this prescription',
      );
    }

    if (userRole === UserRole.NURSE && userHospitalId) {
      // Check if patient is from nurse's hospital
      const patientDoc = await this.firebaseService
        .collection(PatientCollection)
        .doc(prescription.patientId)
        .get();

      if (patientDoc.exists) {
        const patientData = patientDoc.data();
        if (patientData?.hospitalId !== userHospitalId) {
          throw new ForbiddenException(
            'You do not have permission to view this prescription',
          );
        }
      }
    }

    return prescription;
  }

  /**
   * Get prescriptions by consultation ID
   */
  async findByConsultationId(
    consultationId: string,
    userRole: UserRole,
    userId?: string,
  ): Promise<Prescription[]> {
    const prescriptions =
      await this.prescriptionsRepository.findByConsultationId(consultationId);

    // DOCTOR can only see prescriptions they created
    if (userRole === UserRole.DOCTOR && userId) {
      return prescriptions.filter((p) => p.doctorId === userId);
    }

    return prescriptions;
  }

  /**
   * Get prescriptions by patient ID with access control
   */
  async findByPatientId(
    patientId: string,
    userRole: UserRole,
    userHospitalId?: string | null,
  ): Promise<Prescription[]> {
    const prescriptions =
      await this.prescriptionsRepository.findByPatientId(patientId);

    // NURSE can only see prescriptions for patients from their hospital
    if (userRole === UserRole.NURSE && userHospitalId) {
      const patientDoc = await this.firebaseService
        .collection(PatientCollection)
        .doc(patientId)
        .get();

      if (patientDoc.exists) {
        const patientData = patientDoc.data();
        if (patientData?.hospitalId !== userHospitalId) {
          return [];
        }
      } else {
        return [];
      }
    }

    return prescriptions;
  }

  /**
   * Update prescription (DOCTOR can update their own, ADMIN can update any)
   */
  async update(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Prescription> {
    const prescription = await this.findById(
      id,
      userRole,
      userId,
      null,
    );

    // Only doctor who created it or admin can update
    if (userRole !== UserRole.ADMIN && prescription.doctorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this prescription',
      );
    }

    // Doctors cannot mark as dispensed (only nurses/admins can)
    if (
      updatePrescriptionDto.isDispensed &&
      userRole === UserRole.DOCTOR
    ) {
      throw new ForbiddenException(
        'Doctors cannot mark prescriptions as dispensed',
      );
    }

    // If marking as dispensed, set dispensedBy and dispensedAt
    if (updatePrescriptionDto.isDispensed && !prescription.isDispensed) {
      updatePrescriptionDto = {
        ...updatePrescriptionDto,
        dispensedBy: userId,
        dispensedAt: new Date(),
      } as any;
    }

    const updated = await this.prescriptionsRepository.update(id, {
      ...updatePrescriptionDto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Mark prescription as dispensed (NURSE or ADMIN)
   */
  async markAsDispensed(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Prescription> {
    if (userRole !== UserRole.NURSE && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only nurses and admins can mark prescriptions as dispensed',
      );
    }

    return await this.update(
      id,
      { isDispensed: true },
      userId,
      userRole,
    );
  }

  /**
   * Delete prescription (ADMIN only)
   */
  async delete(id: string): Promise<void> {
    const prescription = await this.prescriptionsRepository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    await this.prescriptionsRepository.delete(id);
  }
}
