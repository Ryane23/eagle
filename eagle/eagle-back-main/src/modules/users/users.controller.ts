import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from '../auth/dto';
import { UpdateUserDto } from './dto';
import { UserRole } from './entities/user.entity';
import type { User } from './entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List users with optional hierarchy filters' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'hospitalId', type: String, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('hospitalId') hospitalId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll({
      role,
      hospitalId,
      isActive:
        isActive === undefined ? undefined : isActive.toLowerCase() === 'true',
    });
  }

  @Get('doctors')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  @ApiOperation({ summary: 'List active doctors' })
  async findDoctors() {
    return this.usersService.findDoctors();
  }

  @Get('care-team')
  @Roles(
    UserRole.NURSE,
    UserRole.DOCTOR,
    UserRole.SECONDARY_SECRETARY,
    UserRole.PRIMARY_SECRETARY,
  )
  @ApiOperation({ summary: 'List staff in the current hospital referral tree' })
  async findCareTeam(@CurrentUser() user: User) {
    return this.usersService.findCareTeam(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user by ID' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user and validate hospital ownership' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate a user' })
  async activate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a user' })
  async deactivate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user by deactivating the account' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }
}
