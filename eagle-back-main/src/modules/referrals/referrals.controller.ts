import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto, AcceptReferralDto, RejectReferralDto, UpdateReferralDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ReferralStatus } from './entities/referral.entity';

@ApiTags('Referrals')
@ApiBearerAuth('JWT-auth')
@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new referral' })
  async create(@Body() createReferralDto: CreateReferralDto, @CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.referralsService.create(createReferralDto, user.id, user.hospitalId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all referrals (ADMIN only)' })
  async findAll() {
    return await this.referralsService.findAll();
  }

  @Get('my-hospital/sent')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get referrals sent from my hospital' })
  async findSentByMyHospital(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.referralsService.findByFromHospital(user.hospitalId);
  }

  @Get('my-hospital/received')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get referrals received by my hospital' })
  async findReceivedByMyHospital(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.referralsService.findByToHospital(user.hospitalId);
  }

  @Get('my-hospital/pending')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get pending referrals for my hospital (inbox)' })
  async findPendingForMyHospital(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.referralsService.findPendingByHospital(user.hospitalId);
  }

  @Get('my-hospital/stats')
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get referral statistics for my hospital' })
  async getMyHospitalStats(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.referralsService.getHospitalStats(user.hospitalId);
  }

  @Get('my')
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get referrals I created' })
  async findMy(@CurrentUser() user: User) {
    return await this.referralsService.findByReferrer(user.id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get referrals by patient ID' })
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.referralsService.findByPatient(patientId);
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get referrals by status' })
  async findByStatus(@Param('status') status: ReferralStatus) {
    return await this.referralsService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get referral by ID' })
  async findById(@Param('id') id: string) {
    return await this.referralsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Update referral' })
  async update(@Param('id') id: string, @Body() updateReferralDto: UpdateReferralDto) {
    return await this.referralsService.update(id, updateReferralDto);
  }

  @Post(':id/accept')
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Accept a referral (receiving hospital)' })
  async accept(
    @Param('id') id: string,
    @Body() acceptDto: AcceptReferralDto,
    @CurrentUser() user: User,
  ) {
    return await this.referralsService.accept(id, user.id, acceptDto);
  }

  @Post(':id/reject')
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Reject a referral (receiving hospital)' })
  async reject(@Param('id') id: string, @Body() rejectDto: RejectReferralDto) {
    return await this.referralsService.reject(id, rejectDto);
  }

  @Patch(':id/in-transit')
  @Roles(UserRole.NURSE, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Mark referral as in transit' })
  async markInTransit(@Param('id') id: string) {
    return await this.referralsService.markInTransit(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.NURSE, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Complete a referral (patient arrived)' })
  async complete(@Param('id') id: string) {
    return await this.referralsService.complete(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Cancel a referral' })
  async cancel(@Param('id') id: string) {
    return await this.referralsService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a referral (ADMIN only)' })
  async delete(@Param('id') id: string) {
    await this.referralsService.delete(id);
  }
}
