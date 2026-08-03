import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SpecialtiesRepository } from './specialties.repository';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto';
import { Specialty } from './entities/specialty.entity';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly specialtiesRepository: SpecialtiesRepository) {}

  /**
   * Create specialty (Admin only)
   */
  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    // Check if specialty with same name already exists
    const existing = await this.specialtiesRepository.searchByName(
      createSpecialtyDto.name,
    );
    const exactMatch = existing.find(
      s => s.name.toLowerCase() === createSpecialtyDto.name.toLowerCase(),
    );

    if (exactMatch) {
      throw new ConflictException(
        `Specialty with name "${createSpecialtyDto.name}" already exists`,
      );
    }

    const specialtyData: Partial<Specialty> = {
      ...createSpecialtyDto,
      isActive: true,
      displayOrder: createSpecialtyDto.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.specialtiesRepository.create(specialtyData);
  }

  /**
   * Get all specialties
   */
  async findAll(activeOnly: boolean = false): Promise<Specialty[]> {
    if (activeOnly) {
      return await this.specialtiesRepository.findActive();
    }
    return await this.specialtiesRepository.findAll();
  }

  /**
   * Get specialty by ID
   */
  async findById(id: string): Promise<Specialty> {
    const specialty = await this.specialtiesRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }
    return specialty;
  }

  /**
   * Search specialties by name
   */
  async search(query: string): Promise<Specialty[]> {
    return await this.specialtiesRepository.searchByName(query);
  }

  /**
   * Update specialty (Admin only)
   */
  async update(
    id: string,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    const specialty = await this.findById(id);

    // Check name uniqueness if being updated
    if (updateSpecialtyDto.name && updateSpecialtyDto.name !== specialty.name) {
      const existing = await this.specialtiesRepository.searchByName(
        updateSpecialtyDto.name,
      );
      const exactMatch = existing.find(
        s =>
          s.name.toLowerCase() === updateSpecialtyDto.name!.toLowerCase() &&
          s.id !== id,
      );

      if (exactMatch) {
        throw new ConflictException(
          `Specialty with name "${updateSpecialtyDto.name}" already exists`,
        );
      }
    }

    const updated = await this.specialtiesRepository.update(id, {
      ...updateSpecialtyDto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Delete specialty (Admin only) - Soft delete
   */
  async delete(id: string): Promise<void> {
    const specialty = await this.findById(id);
    await this.specialtiesRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Activate specialty (Admin only)
   */
  async activate(id: string): Promise<Specialty> {
    const specialty = await this.findById(id);
    const updated = await this.specialtiesRepository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Deactivate specialty (Admin only)
   */
  async deactivate(id: string): Promise<Specialty> {
    const specialty = await this.findById(id);
    const updated = await this.specialtiesRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    return updated;
  }
}
