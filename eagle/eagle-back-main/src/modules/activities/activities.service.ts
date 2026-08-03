import { Injectable } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto';
import { Activity, ActivityResource, ActivityType } from './entities/activity.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  /**
   * Log an activity
   */
  async log(
    userId: string,
    userRole: UserRole,
    createActivityDto: CreateActivityDto,
    hospitalId?: string | null,
  ): Promise<Activity> {
    const activityData: Partial<Activity> = {
      userId,
      userRole,
      ...createActivityDto,
      hospitalId: hospitalId || null,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    return await this.activitiesRepository.create(activityData);
  }

  /**
   * Get all activities (ADMIN only)
   */
  async findAll(limit: number = 100): Promise<Activity[]> {
    return await this.activitiesRepository.findRecent(limit);
  }

  /**
   * Get activities by user ID
   */
  async findByUser(userId: string, limit: number = 100): Promise<Activity[]> {
    return await this.activitiesRepository.findByUser(userId, limit);
  }

  /**
   * Get activities by resource
   */
  async findByResource(
    resource: ActivityResource,
    resourceId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    return await this.activitiesRepository.findByResource(resource, resourceId, limit);
  }

  /**
   * Get activities by type
   */
  async findByType(type: ActivityType, limit: number = 100): Promise<Activity[]> {
    return await this.activitiesRepository.findByType(type, limit);
  }

  /**
   * Get activities by hospital (for hospital-specific filtering)
   */
  async findByHospital(hospitalId: string, limit: number = 100): Promise<Activity[]> {
    return await this.activitiesRepository.findByHospital(hospitalId, limit);
  }

  /**
   * Get activities by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
    return await this.activitiesRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Get activity by ID
   */
  async findById(id: string): Promise<Activity | null> {
    return await this.activitiesRepository.findById(id);
  }

  /**
   * Get activity statistics
   */
  async getStats(userId?: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byResource: Record<string, number>;
  }> {
    const activities = userId
      ? await this.findByUser(userId, 1000)
      : await this.findAll(1000);

    const stats = {
      total: activities.length,
      byType: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
    };

    activities.forEach((activity) => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.byResource[activity.resource] = (stats.byResource[activity.resource] || 0) + 1;
    });

    return stats;
  }
}
