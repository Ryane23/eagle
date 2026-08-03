import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type FaqCategory = "general" | "account" | "consultations" | "urgencies" | "prescriptions" | "technical" | "billing" | "privacy";

export type Faq = {
    id: string;
    question: string;
    answer: string;
    category: FaqCategory;
    tags?: string[];
    order?: number;
    isActive: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
};

export type HelpArticle = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: FaqCategory;
    tags?: string[];
    order?: number;
    isPublished: boolean;
    helpfulCount: number;
    relatedArticleIds?: string[];
    createdAt: string;
    updatedAt: string;
};

export type CreateFaqDto = {
    question: string;
    answer: string;
    category: FaqCategory;
    tags?: string[];
    order?: number;
};

export type UpdateFaqDto = Partial<CreateFaqDto> & {
    isActive?: boolean;
};

export type CreateHelpArticleDto = {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: FaqCategory;
    tags?: string[];
    order?: number;
    relatedArticleIds?: string[];
};

export type UpdateHelpArticleDto = Partial<CreateHelpArticleDto> & {
    isPublished?: boolean;
};

// ============ FAQ API Functions ============

export async function createFaq(data: CreateFaqDto): Promise<Faq> {
    try {
        const response = await apiClient.post<Faq>("/help/faqs", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getFaqs(): Promise<Faq[]> {
    try {
        const response = await apiClient.get<Faq[]>("/help/faqs");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function searchFaqs(query: string): Promise<Faq[]> {
    try {
        const response = await apiClient.get<Faq[]>("/help/faqs/search", {
            params: { q: query },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getFaqsByCategory(category: FaqCategory): Promise<Faq[]> {
    try {
        const response = await apiClient.get<Faq[]>(`/help/faqs/category/${category}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getFaqById(id: string): Promise<Faq> {
    try {
        const response = await apiClient.get<Faq>(`/help/faqs/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateFaq(id: string, data: UpdateFaqDto): Promise<Faq> {
    try {
        const response = await apiClient.patch<Faq>(`/help/faqs/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function markFaqHelpful(id: string): Promise<Faq> {
    try {
        const response = await apiClient.post<Faq>(`/help/faqs/${id}/helpful`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteFaq(id: string): Promise<void> {
    try {
        await apiClient.delete(`/help/faqs/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

// ============ Help Article API Functions ============

export async function createHelpArticle(data: CreateHelpArticleDto): Promise<HelpArticle> {
    try {
        const response = await apiClient.post<HelpArticle>("/help/articles", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getHelpArticles(): Promise<HelpArticle[]> {
    try {
        const response = await apiClient.get<HelpArticle[]>("/help/articles");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function searchHelpArticles(query: string): Promise<HelpArticle[]> {
    try {
        const response = await apiClient.get<HelpArticle[]>("/help/articles/search", {
            params: { q: query },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getHelpArticlesByCategory(category: FaqCategory): Promise<HelpArticle[]> {
    try {
        const response = await apiClient.get<HelpArticle[]>(`/help/articles/category/${category}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getHelpArticleBySlug(slug: string): Promise<HelpArticle> {
    try {
        const response = await apiClient.get<HelpArticle>(`/help/articles/slug/${slug}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getHelpArticleById(id: string): Promise<HelpArticle> {
    try {
        const response = await apiClient.get<HelpArticle>(`/help/articles/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateHelpArticle(id: string, data: UpdateHelpArticleDto): Promise<HelpArticle> {
    try {
        const response = await apiClient.patch<HelpArticle>(`/help/articles/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function markHelpArticleHelpful(id: string): Promise<HelpArticle> {
    try {
        const response = await apiClient.post<HelpArticle>(`/help/articles/${id}/helpful`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteHelpArticle(id: string): Promise<void> {
    try {
        await apiClient.delete(`/help/articles/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
