import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Faq, FaqCollection, FaqCategory, HelpArticle, HelpArticleCollection } from './entities/help.entity';

@Injectable()
export class HelpRepository extends BaseRepository<Faq> {
  constructor(protected readonly firebaseService: FirebaseService) {
    super(firebaseService, FaqCollection);
  }

  // FAQ Methods
  async findActiveFaqs(): Promise<Faq[]> {
    const snapshot = await this.firebaseService
      .collection(FaqCollection)
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Faq));
  }

  async findFaqsByCategory(category: FaqCategory): Promise<Faq[]> {
    const snapshot = await this.firebaseService
      .collection(FaqCollection)
      .where('category', '==', category)
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Faq));
  }

  async searchFaqs(searchTerm: string): Promise<Faq[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - consider using Algolia or similar for production
    const allFaqs = await this.findActiveFaqs();
    const lowerSearch = searchTerm.toLowerCase();
    
    return allFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerSearch) ||
        faq.answer.toLowerCase().includes(lowerSearch) ||
        (faq.tags && faq.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))),
    );
  }

  async incrementFaqViewCount(id: string): Promise<void> {
    const faq = await this.findById(id);
    if (faq) {
      await this.update(id, { viewCount: faq.viewCount + 1 });
    }
  }

  async incrementFaqHelpfulCount(id: string): Promise<void> {
    const faq = await this.findById(id);
    if (faq) {
      await this.update(id, { helpfulCount: faq.helpfulCount + 1 });
    }
  }

  // Help Article Methods
  async findPublishedArticles(): Promise<HelpArticle[]> {
    const snapshot = await this.firebaseService
      .collection(HelpArticleCollection)
      .where('isPublished', '==', true)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HelpArticle));
  }

  async findArticlesByCategory(category: FaqCategory): Promise<HelpArticle[]> {
    const snapshot = await this.firebaseService
      .collection(HelpArticleCollection)
      .where('category', '==', category)
      .where('isPublished', '==', true)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HelpArticle));
  }

  async findArticleBySlug(slug: string): Promise<HelpArticle | null> {
    const snapshot = await this.firebaseService
      .collection(HelpArticleCollection)
      .where('slug', '==', slug)
      .where('isPublished', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as HelpArticle;
  }

  async searchArticles(searchTerm: string): Promise<HelpArticle[]> {
    const allArticles = await this.findPublishedArticles();
    const lowerSearch = searchTerm.toLowerCase();
    
    return allArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerSearch) ||
        article.content.toLowerCase().includes(lowerSearch) ||
        article.excerpt.toLowerCase().includes(lowerSearch) ||
        (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))),
    );
  }

  async incrementArticleViewCount(id: string): Promise<void> {
    const article = await this.firebaseService
      .collection(HelpArticleCollection)
      .doc(id)
      .get();
    
    if (article.exists) {
      const data = article.data() as HelpArticle;
      await this.firebaseService
        .collection(HelpArticleCollection)
        .doc(id)
        .update({ viewCount: data.viewCount + 1 });
    }
  }

  async incrementArticleHelpfulCount(id: string): Promise<void> {
    const article = await this.firebaseService
      .collection(HelpArticleCollection)
      .doc(id)
      .get();
    
    if (article.exists) {
      const data = article.data() as HelpArticle;
      await this.firebaseService
        .collection(HelpArticleCollection)
        .doc(id)
        .update({ helpfulCount: data.helpfulCount + 1 });
    }
  }

  // Generic methods for help articles
  async findArticleById(id: string): Promise<HelpArticle | null> {
    const doc = await this.firebaseService
      .collection(HelpArticleCollection)
      .doc(id)
      .get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as HelpArticle;
  }

  async createArticle(data: Partial<HelpArticle>): Promise<HelpArticle> {
    const docRef = await this.firebaseService
      .collection(HelpArticleCollection)
      .add(data);
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as HelpArticle;
  }

  async updateArticle(id: string, data: Partial<HelpArticle>): Promise<HelpArticle> {
    await this.firebaseService
      .collection(HelpArticleCollection)
      .doc(id)
      .update(data);
    
    return (await this.findArticleById(id))!;
  }

  async deleteArticle(id: string): Promise<void> {
    await this.firebaseService
      .collection(HelpArticleCollection)
      .doc(id)
      .delete();
  }
}
