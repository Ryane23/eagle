import { PartialType } from '@nestjs/mapped-types';
import { CreateHelpArticleDto } from './create-help-article.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHelpArticleDto extends PartialType(CreateHelpArticleDto) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
