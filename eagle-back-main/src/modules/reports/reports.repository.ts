import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Report, ReportCollection, ReportStatus, ReportType } from './entities/report.entity';

@Injectable()
export class ReportsRepository extends BaseRepository<Report> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, ReportCollection);
  }

  /**
   * Find reports by status
   */
  async findByStatus(status: ReportStatus): Promise<Report[]> {
    const querySnapshot = await this.collection
      .where('status', '==', status)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Report, 'id'>,
    }));
  }

  /**
   * Find reports by type
   */
  async findByType(type: ReportType): Promise<Report[]> {
    const querySnapshot = await this.collection
      .where('type', '==', type)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Report, 'id'>,
    }));
  }

  /**
   * Find reports by reporter
   */
  async findByReporter(userId: string): Promise<Report[]> {
    const querySnapshot = await this.collection
      .where('reportedBy', '==', userId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Report, 'id'>,
    }));
  }

  /**
   * Find reports by hospital
   */
  async findByHospital(hospitalId: string): Promise<Report[]> {
    const querySnapshot = await this.collection
      .where('relatedHospitalId', '==', hospitalId)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Report, 'id'>,
    }));
  }
}

