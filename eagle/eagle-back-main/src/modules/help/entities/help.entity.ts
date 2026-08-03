export enum FaqCategory {
  GENERAL = 'general',
  ACCOUNT = 'account',
  CONSULTATIONS = 'consultations',
  URGENCIES = 'urgencies',
  PRESCRIPTIONS = 'prescriptions',
  TECHNICAL = 'technical',
  BILLING = 'billing',
  PRIVACY = 'privacy',
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  tags?: string[] | null; // For search/filtering
  order: number; // Display order within category
  isActive: boolean;
  viewCount: number; // Track popularity
  helpfulCount: number; // How many users found this helpful
  createdBy: string; // Admin/staff who created
  createdAt: Date;
  updatedAt: Date;
}

export const FaqCollection = 'faqs';

export interface HelpArticle {
  id: string;
  title: string;
  slug: string; // URL-friendly identifier
  content: string; // Markdown or HTML content
  excerpt: string; // Short summary
  category: FaqCategory;
  tags?: string[] | null;
  order: number;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  relatedArticleIds?: string[] | null; // Related articles
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const HelpArticleCollection = 'help_articles';
