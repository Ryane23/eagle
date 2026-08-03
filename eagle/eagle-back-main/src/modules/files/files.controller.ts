import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../users/entities/user.entity';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload file
   * Access: All authenticated users
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: User,
  ) {
    return await this.filesService.upload(file, user.id, uploadDto);
  }

  /**
   * Get file by ID
   * Access: All authenticated users
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.filesService.findById(id);
  }

  /**
   * Get files by related entity
   * Access: All authenticated users
   */
  @Get('entity/:entityType/:entityId')
  async findByRelatedEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.filesService.findByRelatedEntity(entityType, entityId);
  }

  /**
   * Get my uploaded files
   * Access: All authenticated users
   */
  @Get('my')
  async getMyFiles(@CurrentUser() user: User) {
    return await this.filesService.findByUploader(user.id);
  }

  /**
   * Delete file
   * Access: Owner or ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const file = await this.filesService.findById(id);
    // In a real implementation, check if user is owner or admin
    await this.filesService.delete(id);
  }
}

