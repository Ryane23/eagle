import { Injectable, NotFoundException } from '@nestjs/common';
import { RulesRepository } from './rules.repository';
import { CreateRuleDto, UpdateRuleDto } from './dto';
import { Rule } from './entities/rule.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RulesService {
  constructor(private readonly rulesRepository: RulesRepository) {}

  /**
   * Create a new rule
   */
  async create(createRuleDto: CreateRuleDto, createdBy: string): Promise<Rule> {
    const ruleData: Partial<Rule> = {
      ...createRuleDto,
      isActive: true,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.rulesRepository.create(ruleData);
  }

  /**
   * Get all rules
   */
  async findAll(): Promise<Rule[]> {
    return await this.rulesRepository.findAll();
  }

  /**
   * Get active rules only
   */
  async findActive(): Promise<Rule[]> {
    return await this.rulesRepository.findActive();
  }

  /**
   * Get rules by role
   */
  async findByRole(role: UserRole): Promise<Rule[]> {
    return await this.rulesRepository.findByRole(role);
  }

  /**
   * Get rule by ID
   */
  async findById(id: string): Promise<Rule> {
    const rule = await this.rulesRepository.findById(id);
    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }
    return rule;
  }

  /**
   * Update rule
   */
  async update(id: string, updateRuleDto: UpdateRuleDto): Promise<Rule> {
    const rule = await this.findById(id);

    const updated = await this.rulesRepository.update(id, {
      ...updateRuleDto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Activate rule
   */
  async activate(id: string): Promise<Rule> {
    return await this.update(id, { isActive: true });
  }

  /**
   * Deactivate rule
   */
  async deactivate(id: string): Promise<Rule> {
    return await this.update(id, { isActive: false });
  }

  /**
   * Delete rule
   */
  async delete(id: string): Promise<void> {
    const rule = await this.findById(id);
    await this.rulesRepository.delete(id);
  }
}
