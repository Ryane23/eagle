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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HelpService } from './help.service';
import { CreateFaqDto, UpdateFaqDto, CreateHelpArticleDto, UpdateHelpArticleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { FaqCategory } from './entities/help.entity';

@ApiTags('Help')
@ApiBearerAuth('JWT-auth')
@Controller('help')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  // ===== FAQ Endpoints =====

  @Post('faqs')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new FAQ (ADMIN, PRIMARY_SECRETARY)' })
  async createFaq(@Body() createFaqDto: CreateFaqDto, @CurrentUser() user: User) {
    return await this.helpService.createFaq(createFaqDto, user.id);
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Get all active FAQs' })
  async findAllFaqs() {
    return await this.helpService.findAllFaqs();
  }

  @Get('faqs/search')
  @ApiOperation({ summary: 'Search FAQs' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async searchFaqs(@Query('q') searchTerm: string) {
    return await this.helpService.searchFaqs(searchTerm);
  }

  @Get('faqs/category/:category')
  @ApiOperation({ summary: 'Get FAQs by category' })
  async findFaqsByCategory(@Param('category') category: FaqCategory) {
    return await this.helpService.findFaqsByCategory(category);
  }

  @Get('faqs/:id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  async findFaqById(@Param('id') id: string) {
    return await this.helpService.findFaqById(id);
  }

  @Patch('faqs/:id')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Update FAQ (ADMIN, PRIMARY_SECRETARY)' })
  async updateFaq(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return await this.helpService.updateFaq(id, updateFaqDto);
  }

  @Post('faqs/:id/helpful')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark FAQ as helpful' })
  async markFaqHelpful(@Param('id') id: string) {
    await this.helpService.markFaqHelpful(id);
  }

  @Delete('faqs/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete FAQ (ADMIN only)' })
  async deleteFaq(@Param('id') id: string) {
    await this.helpService.deleteFaq(id);
  }

  // ===== Help Article Endpoints =====

  @Post('articles')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new help article (ADMIN, PRIMARY_SECRETARY)' })
  async createArticle(
    @Body() createArticleDto: CreateHelpArticleDto,
    @CurrentUser() user: User,
  ) {
    return await this.helpService.createArticle(createArticleDto, user.id);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Get all published articles' })
  async findAllArticles() {
    return await this.helpService.findAllArticles();
  }

  @Get('articles/search')
  @ApiOperation({ summary: 'Search articles' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async searchArticles(@Query('q') searchTerm: string) {
    return await this.helpService.searchArticles(searchTerm);
  }

  @Get('articles/category/:category')
  @ApiOperation({ summary: 'Get articles by category' })
  async findArticlesByCategory(@Param('category') category: FaqCategory) {
    return await this.helpService.findArticlesByCategory(category);
  }

  @Get('articles/slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  async findArticleBySlug(@Param('slug') slug: string) {
    return await this.helpService.findArticleBySlug(slug);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  async findArticleById(@Param('id') id: string) {
    return await this.helpService.findArticleById(id);
  }

  @Patch('articles/:id')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Update article (ADMIN, PRIMARY_SECRETARY)' })
  async updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateHelpArticleDto,
  ) {
    return await this.helpService.updateArticle(id, updateArticleDto);
  }

  @Post('articles/:id/helpful')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark article as helpful' })
  async markArticleHelpful(@Param('id') id: string) {
    await this.helpService.markArticleHelpful(id);
  }

  @Delete('articles/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article (ADMIN only)' })
  async deleteArticle(@Param('id') id: string) {
    await this.helpService.deleteArticle(id);
  }
}
