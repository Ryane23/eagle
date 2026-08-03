import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getFaqs,
    searchFaqs,
    getFaqsByCategory,
    getFaqById,
    createFaq,
    updateFaq,
    markFaqHelpful,
    deleteFaq,
    getHelpArticles,
    searchHelpArticles,
    getHelpArticlesByCategory,
    getHelpArticleBySlug,
    getHelpArticleById,
    createHelpArticle,
    updateHelpArticle,
    markHelpArticleHelpful,
    deleteHelpArticle,
    type Faq,
    type HelpArticle,
    type CreateFaqDto,
    type UpdateFaqDto,
    type CreateHelpArticleDto,
    type UpdateHelpArticleDto,
    type FaqCategory,
} from "@/actions/help";

// ============ Query Keys ============

export const helpKeys = {
    all: ["help"] as const,
    faqs: () => [...helpKeys.all, "faqs"] as const,
    faqList: () => [...helpKeys.faqs(), "list"] as const,
    faqSearch: (q: string) => [...helpKeys.faqs(), "search", q] as const,
    faqCategory: (cat: FaqCategory) => [...helpKeys.faqs(), "category", cat] as const,
    faqDetail: (id: string) => [...helpKeys.faqs(), "detail", id] as const,
    articles: () => [...helpKeys.all, "articles"] as const,
    articleList: () => [...helpKeys.articles(), "list"] as const,
    articleSearch: (q: string) => [...helpKeys.articles(), "search", q] as const,
    articleCategory: (cat: FaqCategory) => [...helpKeys.articles(), "category", cat] as const,
    articleSlug: (slug: string) => [...helpKeys.articles(), "slug", slug] as const,
    articleDetail: (id: string) => [...helpKeys.articles(), "detail", id] as const,
};

// ============ FAQ Queries ============

export function useFaqsQuery() {
    return useQuery<Faq[], Error>({
        queryKey: helpKeys.faqList(),
        queryFn: getFaqs,
        staleTime: 5 * 60 * 1000,
    });
}

export function useFaqSearchQuery(query: string) {
    return useQuery<Faq[], Error>({
        queryKey: helpKeys.faqSearch(query),
        queryFn: () => searchFaqs(query),
        enabled: query.length >= 2,
        staleTime: 60 * 1000,
    });
}

export function useFaqsByCategoryQuery(category: FaqCategory) {
    return useQuery<Faq[], Error>({
        queryKey: helpKeys.faqCategory(category),
        queryFn: () => getFaqsByCategory(category),
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    });
}

export function useFaqQuery(id: string) {
    return useQuery<Faq, Error>({
        queryKey: helpKeys.faqDetail(id),
        queryFn: () => getFaqById(id),
        enabled: !!id,
    });
}

// ============ FAQ Mutations ============

export function useCreateFaq() {
    const queryClient = useQueryClient();
    return useMutation<Faq, Error, CreateFaqDto>({
        mutationFn: createFaq,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.faqs() });
            toast.success("FAQ créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateFaq() {
    const queryClient = useQueryClient();
    return useMutation<Faq, Error, { id: string; data: UpdateFaqDto }>({
        mutationFn: ({ id, data }) => updateFaq(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: helpKeys.faqs() });
            queryClient.invalidateQueries({ queryKey: helpKeys.faqDetail(id) });
            toast.success("FAQ mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useMarkFaqHelpful() {
    const queryClient = useQueryClient();
    return useMutation<Faq, Error, string>({
        mutationFn: markFaqHelpful,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.faqs() });
        },
    });
}

export function useDeleteFaq() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteFaq,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.faqs() });
            toast.success("FAQ supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

// ============ Article Queries ============

export function useHelpArticlesQuery() {
    return useQuery<HelpArticle[], Error>({
        queryKey: helpKeys.articleList(),
        queryFn: getHelpArticles,
        staleTime: 5 * 60 * 1000,
    });
}

export function useHelpArticleSearchQuery(query: string) {
    return useQuery<HelpArticle[], Error>({
        queryKey: helpKeys.articleSearch(query),
        queryFn: () => searchHelpArticles(query),
        enabled: query.length >= 2,
        staleTime: 60 * 1000,
    });
}

export function useHelpArticlesByCategoryQuery(category: FaqCategory) {
    return useQuery<HelpArticle[], Error>({
        queryKey: helpKeys.articleCategory(category),
        queryFn: () => getHelpArticlesByCategory(category),
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    });
}

export function useHelpArticleBySlugQuery(slug: string) {
    return useQuery<HelpArticle, Error>({
        queryKey: helpKeys.articleSlug(slug),
        queryFn: () => getHelpArticleBySlug(slug),
        enabled: !!slug,
    });
}

export function useHelpArticleQuery(id: string) {
    return useQuery<HelpArticle, Error>({
        queryKey: helpKeys.articleDetail(id),
        queryFn: () => getHelpArticleById(id),
        enabled: !!id,
    });
}

// ============ Article Mutations ============

export function useCreateHelpArticle() {
    const queryClient = useQueryClient();
    return useMutation<HelpArticle, Error, CreateHelpArticleDto>({
        mutationFn: createHelpArticle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.articles() });
            toast.success("Article créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateHelpArticle() {
    const queryClient = useQueryClient();
    return useMutation<HelpArticle, Error, { id: string; data: UpdateHelpArticleDto }>({
        mutationFn: ({ id, data }) => updateHelpArticle(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: helpKeys.articles() });
            queryClient.invalidateQueries({ queryKey: helpKeys.articleDetail(id) });
            toast.success("Article mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useMarkHelpArticleHelpful() {
    const queryClient = useQueryClient();
    return useMutation<HelpArticle, Error, string>({
        mutationFn: markHelpArticleHelpful,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.articles() });
        },
    });
}

export function useDeleteHelpArticle() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteHelpArticle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: helpKeys.articles() });
            toast.success("Article supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
