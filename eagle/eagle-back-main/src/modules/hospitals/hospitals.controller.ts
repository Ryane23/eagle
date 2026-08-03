import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  HospitalResponseDto,
  HospitalTreeNodeResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { HospitalType } from './entities/hospital.entity';

@ApiTags('Hospitals')
@ApiBearerAuth('JWT-auth')
@Controller('hospitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new hospital/center',
    description: 'Creates a new hospital or health center. Admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Hospital created successfully',
    type: HospitalResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    return await this.hospitalsService.create(createHospitalDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get all hospitals/centers',
    description: 'Retrieves all hospitals in the network.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of hospitals retrieved successfully',
    type: [HospitalResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async findAll() {
    return await this.hospitalsService.findAll();
  }

  @Get('tree')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get the complete hospital tree',
    description:
      'Returns PRIMARY hospitals as roots with their SUB hospitals nested as children.',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital hierarchy retrieved successfully',
    type: [HospitalTreeNodeResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async findTree() {
    return await this.hospitalsService.findTree();
  }

  @Get('primary/center')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get the PRIMARY center',
    description: 'Retrieves the main primary center (Yaoundé).',
  })
  @ApiResponse({
    status: 200,
    description: 'Primary center retrieved successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Primary center not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findPrimaryCenter() {
    return await this.hospitalsService.findPrimaryCenter();
  }

  @Get('type/:type')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get hospitals by type',
    description: 'Retrieves hospitals filtered by type (PRIMARY or SUB).',
  })
  @ApiParam({
    name: 'type',
    enum: HospitalType,
    description: 'Hospital type filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospitals retrieved successfully',
    type: [HospitalResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findByType(@Param('type') type: HospitalType) {
    return await this.hospitalsService.findByType(type);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get hospital by ID',
    description: 'Retrieves a specific hospital by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: 200,
    description: 'Hospital retrieved successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Hospital not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findById(@Param('id') id: string) {
    return await this.hospitalsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update hospital',
    description: 'Updates hospital information. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: 200,
    description: 'Hospital updated successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Hospital not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return await this.hospitalsService.update(id, updateHospitalDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Activate hospital',
    description: 'Activates a deactivated hospital. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: 200,
    description: 'Hospital activated successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Hospital not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async activate(@Param('id') id: string) {
    return await this.hospitalsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Deactivate hospital',
    description: 'Deactivates an active hospital. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: 200,
    description: 'Hospital deactivated successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Hospital not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async deactivate(@Param('id') id: string) {
    return await this.hospitalsService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete hospital',
    description: 'Deletes a hospital. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({ status: 204, description: 'Hospital deleted successfully' })
  @ApiNotFoundResponse({ description: 'Hospital not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.hospitalsService.delete(id);
  }
}
