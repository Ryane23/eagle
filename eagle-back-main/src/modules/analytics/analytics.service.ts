import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import {
  BranchStatistics,
  NetworkOverview,
} from './entities/analytics.entity';
import {
  UserCollection,
  UserRole,
} from '../users/entities/user.entity';
import {
  HospitalCollection,
  HospitalType,
  Hospital,
} from '../hospitals/entities/hospital.entity';
import {
  PatientCollection,
  Patient,
} from '../patients/entities/patient.entity';
import {
  ConsultationCollection,
  ConsultationStatus,
  ConsultationType,
  Consultation,
} from '../consultations/entities/consultation.entity';
import {
  QueueCollection,
  QueueStatus,
  Queue,
} from '../queue/entities/queue.entity';
import {
  ReportCollection,
  ReportStatus,
  Report,
} from '../reports/entities/report.entity';
import {
  ComplaintCollection,
  ComplaintStatus,
  ComplaintPriority,
  Complaint,
} from '../complaints/entities/complaint.entity';
import {
  User,
} from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Get network overview (all branches)
   */
  async getNetworkOverview(): Promise<NetworkOverview> {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all hospitals
    const hospitalsSnapshot = await this.firebaseService
      .collection(HospitalCollection)
      .get();
    const hospitals = hospitalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Hospital[];

    const totalHospitals = hospitals.length;
    const primaryCenters = hospitals.filter(h => h.type === HospitalType.PRIMARY).length;
    const secondaryCenters = hospitals.filter(h => h.type === HospitalType.SECONDARY).length;
    const activeHospitals = hospitals.filter(h => h.isActive === true).length;

    // Get all users
    const usersSnapshot = await this.firebaseService
      .collection(UserCollection)
      .get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive === true).length;

    // Get all patients
    const patientsSnapshot = await this.firebaseService
      .collection(PatientCollection)
      .get();
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Patient[];

    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.isActive === true).length;

    // Get consultations
    const consultationsSnapshot = await this.firebaseService
      .collection(ConsultationCollection)
      .get();
    const consultations = consultationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    const totalConsultations = consultations.length;
    const consultationsToday = consultations.filter(c => {
      const created = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
      return created >= startOfToday;
    }).length;
    const consultationsThisWeek = consultations.filter(c => {
      const created = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
      return created >= startOfWeek;
    }).length;
    const consultationsThisMonth = consultations.filter(c => {
      const created = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
      return created >= startOfMonth;
    }).length;

    // Get queue entries
    const queueSnapshot = await this.firebaseService
      .collection(QueueCollection)
      .get();
    const queueEntries = queueSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Queue[];

    const totalQueueEntries = queueEntries.length;
    const activeQueueEntries = queueEntries.filter(
      q => q.status === QueueStatus.WAITING || q.status === QueueStatus.IN_PROGRESS,
    ).length;

    // Get reports
    const reportsSnapshot = await this.firebaseService
      .collection(ReportCollection)
      .get();
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Report[];

    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING).length;

    // Get complaints
    const complaintsSnapshot = await this.firebaseService
      .collection(ComplaintCollection)
      .get();
    const complaints = complaintsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Complaint[];

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === ComplaintStatus.PENDING).length;
    const urgentComplaints = complaints.filter(
      c => c.priority === ComplaintPriority.URGENT && c.status !== ComplaintStatus.RESOLVED,
    ).length;

    // Get branch statistics
    const branchStatistics = await Promise.all(
      hospitals.map(hospital => this.getBranchStatistics(hospital.id)),
    );

    return {
      totalHospitals,
      primaryCenters,
      secondaryCenters,
      activeHospitals,
      totalUsers,
      activeUsers,
      totalPatients,
      activePatients,
      totalConsultations,
      consultationsToday,
      consultationsThisWeek,
      consultationsThisMonth,
      totalQueueEntries,
      activeQueueEntries,
      totalReports,
      pendingReports,
      totalComplaints,
      pendingComplaints,
      urgentComplaints,
      branchStatistics,
      generatedAt: new Date(),
    };
  }

  /**
   * Get statistics for a specific branch/hospital
   */
  async getBranchStatistics(hospitalId: string): Promise<BranchStatistics> {
    // Get hospital info
    const hospitalDoc = await this.firebaseService
      .collection(HospitalCollection)
      .doc(hospitalId)
      .get();
    const hospital = hospitalDoc.exists
      ? ({ id: hospitalDoc.id, ...hospitalDoc.data() } as Hospital)
      : null;

    if (!hospital) {
      throw new Error(`Hospital with ID ${hospitalId} not found`);
    }

    // Get users for this hospital
    const usersSnapshot = await this.firebaseService
      .collection(UserCollection)
      .where('hospitalId', '==', hospitalId)
      .get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive === true).length;
    const usersByRole = {
      admin: users.filter(u => u.role === UserRole.ADMIN).length,
      primary_secretary: users.filter(u => u.role === UserRole.PRIMARY_SECRETARY).length,
      secondary_secretary: users.filter(u => u.role === UserRole.SECONDARY_SECRETARY).length,
      nurse: users.filter(u => u.role === UserRole.NURSE).length,
      doctor: users.filter(u => u.role === UserRole.DOCTOR).length,
    };

    // Get patients (patients don't have hospitalId, so we'll count all)
    // In a real system, you might link patients to hospitals through consultations
    const patientsSnapshot = await this.firebaseService
      .collection(PatientCollection)
      .get();
    const allPatients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    })) as Patient[];

    // Get consultations for doctors in this hospital
    const doctorIds = users.filter(u => u.role === UserRole.DOCTOR).map(u => u.id);
    const consultationsSnapshot = await this.firebaseService
      .collection(ConsultationCollection)
      .get();
    const allConsultations = consultationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      startedAt: doc.data().startedAt?.toDate?.() || doc.data().startedAt,
      endedAt: doc.data().endedAt?.toDate?.() || doc.data().endedAt,
    })) as Consultation[];

    const hospitalConsultations = allConsultations.filter(c =>
      doctorIds.includes(c.doctorId),
    );

    const totalConsultations = hospitalConsultations.length;
    const consultationsByStatus = {
      scheduled: hospitalConsultations.filter(c => c.status === ConsultationStatus.SCHEDULED).length,
      in_progress: hospitalConsultations.filter(c => c.status === ConsultationStatus.IN_PROGRESS).length,
      completed: hospitalConsultations.filter(c => c.status === ConsultationStatus.COMPLETED).length,
      cancelled: hospitalConsultations.filter(c => c.status === ConsultationStatus.CANCELLED).length,
    };
    const consultationsByType = {
      video: hospitalConsultations.filter(c => c.type === ConsultationType.VIDEO).length,
      audio: hospitalConsultations.filter(c => c.type === ConsultationType.AUDIO).length,
      chat: hospitalConsultations.filter(c => c.type === ConsultationType.CHAT).length,
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const consultationsThisMonth = hospitalConsultations.filter(c => {
      const created = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
      return created >= startOfMonth;
    }).length;

    // Calculate average consultation duration
    const completedConsultations = hospitalConsultations.filter(
      (c): c is Consultation & { startedAt: Date; endedAt: Date } =>
        c.status === ConsultationStatus.COMPLETED && 
        c.startedAt != null && 
        c.endedAt != null,
    );
    let averageConsultationDuration: number | undefined;
    if (completedConsultations.length > 0) {
      const totalDuration = completedConsultations.reduce((sum, c) => {
        const start = c.startedAt instanceof Date ? c.startedAt : new Date(c.startedAt);
        const end = c.endedAt instanceof Date ? c.endedAt : new Date(c.endedAt);
        return sum + (end.getTime() - start.getTime());
      }, 0);
      averageConsultationDuration = Math.round(totalDuration / completedConsultations.length / 60000); // in minutes
    }

    // Get queue entries (linked through consultations)
    const consultationIds = hospitalConsultations.map(c => c.id);
    const queueSnapshot = await this.firebaseService
      .collection(QueueCollection)
      .get();
    const allQueueEntries = queueSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Queue[];

    const hospitalQueueEntries = allQueueEntries.filter(q =>
      q.consultationId != null && consultationIds.includes(q.consultationId),
    );

    const totalQueueEntries = hospitalQueueEntries.length;
    const queueByStatus = {
      waiting: hospitalQueueEntries.filter(q => q.status === QueueStatus.WAITING).length,
      in_progress: hospitalQueueEntries.filter(q => q.status === QueueStatus.IN_PROGRESS).length,
      completed: hospitalQueueEntries.filter(q => q.status === QueueStatus.COMPLETED).length,
      cancelled: hospitalQueueEntries.filter(q => q.status === QueueStatus.CANCELLED).length,
    };

    // Get reports for this hospital
    const reportsSnapshot = await this.firebaseService
      .collection(ReportCollection)
      .where('relatedHospitalId', '==', hospitalId)
      .get();
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Report[];

    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING).length;

    // Get complaints for this hospital
    const complaintsSnapshot = await this.firebaseService
      .collection(ComplaintCollection)
      .where('relatedHospitalId', '==', hospitalId)
      .get();
    const complaints = complaintsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Complaint[];

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === ComplaintStatus.PENDING).length;
    const urgentComplaints = complaints.filter(
      c => c.priority === ComplaintPriority.URGENT && c.status !== ComplaintStatus.RESOLVED,
    ).length;

    // Get patients linked through consultations
    const patientIds = [...new Set(hospitalConsultations.map(c => c.patientId))];
    const hospitalPatients = allPatients.filter(p => patientIds.includes(p.id));
    const totalPatients = hospitalPatients.length;
    const activePatients = hospitalPatients.filter(p => p.isActive === true).length;
    const newPatientsThisMonth = hospitalPatients.filter(p => {
      const created = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt);
      return created >= startOfMonth;
    }).length;

    // Get last activity
    const allActivities = [
      ...hospitalConsultations.map(c => c.createdAt),
      ...hospitalQueueEntries.map(q => q.createdAt),
      ...reports.map(r => r.createdAt),
      ...complaints.map(c => c.createdAt),
    ].filter(Boolean).map(d => d instanceof Date ? d : new Date(d));
    const lastActivityAt = allActivities.length > 0
      ? new Date(Math.max(...allActivities.map(d => d.getTime())))
      : undefined;

    return {
      hospitalId: hospital.id,
      hospitalName: hospital.name || 'Unknown',
      hospitalType: hospital.type || 'Unknown',
      totalUsers,
      activeUsers,
      usersByRole,
      totalPatients,
      activePatients,
      newPatientsThisMonth,
      totalConsultations,
      consultationsByStatus,
      consultationsByType,
      consultationsThisMonth,
      averageConsultationDuration,
      totalQueueEntries,
      queueByStatus,
      totalReports,
      pendingReports,
      totalComplaints,
      pendingComplaints,
      urgentComplaints,
      lastActivityAt,
      createdAt: new Date(),
    };
  }
}

