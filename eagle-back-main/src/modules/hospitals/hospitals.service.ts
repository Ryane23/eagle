import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HospitalsRepository } from './hospitals.repository';
import { CreateHospitalDto, UpdateHospitalDto } from './dto';
import { Hospital, HospitalType } from './entities/hospital.entity';

@Injectable()
export class HospitalsService {
  constructor(private readonly hospitalsRepository: HospitalsRepository) {}

  /**
   * Create a new hospital/center
   */
  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const hospitalData = {
      ...createHospitalDto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.hospitalsRepository.create(hospitalData);
  }

  /**
   * Get all hospitals/centers
   */
  async findAll(): Promise<Hospital[]> {
    return await this.hospitalsRepository.findAll();
  }

  /**
   * Get a specific hospital by ID
   */
  async findById(id: string): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findById(id);
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return hospital;
  }

  /**
   * Get hospitals by type (PRIMARY or SECONDARY)
   */
  async findByType(type: HospitalType): Promise<Hospital[]> {
    return await this.hospitalsRepository.findByType(type);
  }

  /**
   * Get the PRIMARY center
   */
  async findPrimaryCenter(): Promise<Hospital> {
    const primaryCenter = await this.hospitalsRepository.findPrimaryCenter();
    if (!primaryCenter) {
      throw new NotFoundException('PRIMARY center not found');
    }
    return primaryCenter;
  }

  /**
   * Update a hospital
   */
  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const hospital = await this.findById(id);

    const updatedData = {
      ...updateHospitalDto,
      updatedAt: new Date(),
    };

    const updated = await this.hospitalsRepository.update(id, updatedData);
    if (!updated) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Activate a hospital
   */
  async activate(id: string): Promise<Hospital> {
    await this.findById(id); // Ensure hospital exists
    const updated = await this.hospitalsRepository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Deactivate a hospital
   */
  async deactivate(id: string): Promise<Hospital> {
    const hospital = await this.findById(id);

    const updated = await this.hospitalsRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete a hospital (soft delete by deactivating)
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.hospitalsRepository.delete(id);
  }
}
