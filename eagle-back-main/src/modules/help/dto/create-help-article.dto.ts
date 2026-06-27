import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { FaqCategory } from '../entities/help.entity';

export class CreateHelpArticleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  excerpt: string;

  @IsEnum(FaqCategory)
  @IsNotEmpty()
  category: FaqCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedArticleIds?: string[] | null;
}
