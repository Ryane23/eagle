import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HospitalsRepository } from './hospitals.repository';
import { CreateHospitalDto, UpdateHospitalDto } from './dto';
import {
  Hospital,
  HospitalTreeNode,
  HospitalType,
} from './entities/hospital.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class HospitalsService {
  constructor(private readonly hospitalsRepository: HospitalsRepository) {}

  /**
   * Create a new hospital/center
   */
  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const parentHospitalId = await this.validateHierarchy(
      createHospitalDto.type,
      createHospitalDto.parentHospitalId,
    );
    const hospitalData = {
      ...createHospitalDto,
      parentHospitalId,
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
   * Get the complete hospital hierarchy as PRIMARY roots with nested children.
   */
  async findTree(): Promise<HospitalTreeNode[]> {
    const hospitals = await this.hospitalsRepository.findAll();
    const nodes = new Map<string, HospitalTreeNode>(
      hospitals.map((hospital) => [
        hospital.id,
        {
          ...hospital,
          children: [],
        },
      ]),
    );
    const roots: HospitalTreeNode[] = [];

    for (const node of nodes.values()) {
      if (node.type === HospitalType.PRIMARY) {
        if (node.parentHospitalId !== null) {
          throw new ConflictException(
            `PRIMARY hospital ${node.id} cannot have a parent`,
          );
        }
        roots.push(node);
        continue;
      }

      if (!node.parentHospitalId) {
        throw new ConflictException(
          `SUB hospital ${node.id} has no parent hospital`,
        );
      }

      const parent = nodes.get(node.parentHospitalId);
      if (
        !parent ||
        parent.type !== HospitalType.PRIMARY ||
        parent.parentHospitalId !== null
      ) {
        throw new ConflictException(
          `SUB hospital ${node.id} references an invalid parent`,
        );
      }

      parent.children.push(node);
    }

    const byName = (left: HospitalTreeNode, right: HospitalTreeNode) =>
      left.name.localeCompare(right.name);
    roots.sort(byName);
    roots.forEach((root) => root.children.sort(byName));

    return roots;
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
   * Get hospitals by type (PRIMARY or SUB)
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

  async validateUserAssignment(
    role: UserRole,
    hospitalId?: string | null,
    specialtyId?: string | null,
  ): Promise<void> {
    if (role === UserRole.ADMIN && !hospitalId) {
      return;
    }

    if (!hospitalId) {
      throw new BadRequestException(
        'Users must be assigned to exactly one hospital',
      );
    }

    const hospital = await this.findById(hospitalId);
    if (!hospital.isActive) {
      throw new BadRequestException(
        'Users cannot be assigned to an inactive hospital',
      );
    }

    if (
      role === UserRole.PRIMARY_SECRETARY &&
      hospital.type !== HospitalType.PRIMARY
    ) {
      throw new BadRequestException(
        'Primary secretaries must belong to a PRIMARY hospital',
      );
    }

    if (
      [UserRole.SECONDARY_SECRETARY, UserRole.NURSE].includes(role) &&
      hospital.type !== HospitalType.SUB
    ) {
      throw new BadRequestException(
        'Secondary secretaries and nurses must belong to a SUB hospital',
      );
    }

    if (
      role === UserRole.DOCTOR &&
      specialtyId &&
      hospital.type !== HospitalType.PRIMARY
    ) {
      throw new BadRequestException(
        'Specialist doctors must belong to a PRIMARY hospital',
      );
    }
  }

  /**
   * Update a hospital
   */
  async update(
    id: string,
    updateHospitalDto: UpdateHospitalDto,
  ): Promise<Hospital> {
    const hospital = await this.findById(id);
    const targetType = updateHospitalDto.type ?? hospital.type;
    const parentWasProvided = updateHospitalDto.parentHospitalId !== undefined;
    const requestedParentId = parentWasProvided
      ? updateHospitalDto.parentHospitalId
      : targetType === HospitalType.PRIMARY
        ? null
        : hospital.parentHospitalId;

    if (targetType === HospitalType.SUB) {
      const children = await this.hospitalsRepository.findChildren(id);
      if (children.length > 0) {
        throw new ConflictException(
          'A hospital with child hospitals cannot be changed to SUB',
        );
      }
    }

    const parentHospitalId = await this.validateHierarchy(
      targetType,
      requestedParentId,
      id,
    );

    const updatedData = {
      ...updateHospitalDto,
      parentHospitalId,
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
    const children = await this.hospitalsRepository.findChildren(id);
    if (children.length > 0) {
      throw new ConflictException(
        'Cannot delete a hospital while child hospitals reference it',
      );
    }
    await this.hospitalsRepository.delete(id);
  }

  private async validateHierarchy(
    type: HospitalType,
    parentHospitalId?: string | null,
    hospitalId?: string,
  ): Promise<string | null> {
    if (type === HospitalType.PRIMARY) {
      if (parentHospitalId) {
        throw new BadRequestException(
          'PRIMARY hospitals cannot have a parent hospital',
        );
      }
      return null;
    }

    if (!parentHospitalId) {
      throw new BadRequestException(
        'SUB hospitals must reference a parent PRIMARY hospital',
      );
    }

    if (hospitalId && parentHospitalId === hospitalId) {
      throw new BadRequestException('A hospital cannot be its own parent');
    }

    const parent = await this.hospitalsRepository.findById(parentHospitalId);
    if (!parent) {
      throw new BadRequestException(
        `Parent hospital with ID ${parentHospitalId} not found`,
      );
    }

    if (
      parent.type !== HospitalType.PRIMARY ||
      parent.parentHospitalId !== null
    ) {
      throw new BadRequestException(
        'SUB hospitals must reference a root PRIMARY hospital',
      );
    }

    if (!parent.isActive) {
      throw new BadRequestException(
        'SUB hospitals cannot be attached to an inactive PRIMARY hospital',
      );
    }

    return parent.id;
  }
}
