import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Specialties')
@ApiBearerAuth('JWT-auth')
@Controller('specialties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  /**
   * Create specialty
   * Access: ADMIN only
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return await this.specialtiesService.create(createSpecialtyDto);
  }

  /**
   * Get all specialties
   * Access: All authenticated users
   */
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly === 'true';
    return await this.specialtiesService.findAll(active);
  }

  /**
   * Search specialties
   * Access: All authenticated users
   */
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return await this.specialtiesService.search(query);
  }

  /**
   * Get specialty by ID
   * Access: All authenticated users
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.specialtiesService.findById(id);
  }

  /**
   * Update specialty
   * Access: ADMIN only
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return await this.specialtiesService.update(id, updateSpecialtyDto);
  }

  /**
   * Activate specialty
   * Access: ADMIN only
   */
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string) {
    return await this.specialtiesService.activate(id);
  }

  /**
   * Deactivate specialty
   * Access: ADMIN only
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    return await this.specialtiesService.deactivate(id);
  }

  /**
   * Delete specialty (soft delete)
   * Access: ADMIN only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.specialtiesService.delete(id);
  }
}
