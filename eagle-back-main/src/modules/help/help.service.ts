import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { HelpRepository } from './help.repository';
import { CreateFaqDto, UpdateFaqDto, CreateHelpArticleDto, UpdateHelpArticleDto } from './dto';
import { Faq, FaqCategory, HelpArticle } from './entities/help.entity';

@Injectable()
export class HelpService {
  constructor(private readonly helpRepository: HelpRepository) {}

  // ===== FAQ Methods =====

  /**
   * Create a new FAQ
   */
  async createFaq(createDto: CreateFaqDto, createdBy: string): Promise<Faq> {
    const faqData: Partial<Faq> = {
      ...createDto,
      order: createDto.order || 0,
      isActive: true,
      viewCount: 0,
      helpfulCount: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.helpRepository.create(faqData);
  }

  /**
   * Get all active FAQs
   */
  async findAllFaqs(): Promise<Faq[]> {
    return await this.helpRepository.findActiveFaqs();
  }

  /**
   * Get FAQ by ID
   */
  async findFaqById(id: string): Promise<Faq | null> {
    const faq = await this.helpRepository.findById(id);
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    // Increment view count
    await this.helpRepository.incrementFaqViewCount(id);
    
    return faq;
  }

  /**
   * Get FAQs by category
   */
  async findFaqsByCategory(category: FaqCategory): Promise<Faq[]> {
    return await this.helpRepository.findFaqsByCategory(category);
  }

  /**
   * Search FAQs
   */
  async searchFaqs(searchTerm: string): Promise<Faq[]> {
    return await this.helpRepository.searchFaqs(searchTerm);
  }

  /**
   * Update FAQ
   */
  async updateFaq(id: string, updateDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findFaqById(id);
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    return await this.helpRepository.update(id, {
      ...updateDto,
      updatedAt: new Date(),
    }) as Faq;
  }

  /**
   * Mark FAQ as helpful
   */
  async markFaqHelpful(id: string): Promise<void> {
    await this.helpRepository.incrementFaqHelpfulCount(id);
  }

  /**
   * Delete FAQ
   */
  async deleteFaq(id: string): Promise<void> {
    await this.findFaqById(id);
    await this.helpRepository.delete(id);
  }

  // ===== Help Article Methods =====

  /**
   * Create a new help article
   */
  async createArticle(createDto: CreateHelpArticleDto, createdBy: string): Promise<HelpArticle> {
    // Check if slug already exists
    const existing = await this.helpRepository.findArticleBySlug(createDto.slug);
    if (existing) {
      throw new ConflictException(`Article with slug "${createDto.slug}" already exists`);
    }

    const articleData: Partial<HelpArticle> = {
      ...createDto,
      order: createDto.order || 0,
      isPublished: false, // Default to draft
      viewCount: 0,
      helpfulCount: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.helpRepository.createArticle(articleData);
  }

  /**
   * Get all published articles
   */
  async findAllArticles(): Promise<HelpArticle[]> {
    return await this.helpRepository.findPublishedArticles();
  }

  /**
   * Get article by ID
   */
  async findArticleById(id: string): Promise<HelpArticle | null> {
    const article = await this.helpRepository.findArticleById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    
    // Increment view count
    await this.helpRepository.incrementArticleViewCount(id);
    
    return article;
  }

  /**
   * Get article by slug
   */
  async findArticleBySlug(slug: string): Promise<HelpArticle | null> {
    const article = await this.helpRepository.findArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }
    
    // Increment view count
    await this.helpRepository.incrementArticleViewCount(article.id);
    
    return article;
  }

  /**
   * Get articles by category
   */
  async findArticlesByCategory(category: FaqCategory): Promise<HelpArticle[]> {
    return await this.helpRepository.findArticlesByCategory(category);
  }

  /**
   * Search articles
   */
  async searchArticles(searchTerm: string): Promise<HelpArticle[]> {
    return await this.helpRepository.searchArticles(searchTerm);
  }

  /**
   * Update article
   */
  async updateArticle(id: string, updateDto: UpdateHelpArticleDto): Promise<HelpArticle> {
    await this.findArticleById(id);
    
    // If slug is being updated, check for conflicts
    if (updateDto.slug) {
      const existing = await this.helpRepository.findArticleBySlug(updateDto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Article with slug "${updateDto.slug}" already exists`);
      }
    }
    
    return await this.helpRepository.updateArticle(id, {
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  /**
   * Mark article as helpful
   */
  async markArticleHelpful(id: string): Promise<void> {
    await this.helpRepository.incrementArticleHelpfulCount(id);
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    await this.findArticleById(id);
    await this.helpRepository.deleteArticle(id);
  }
}
