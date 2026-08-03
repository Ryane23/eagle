import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getRules,
    getRuleById,
    createRule,
    updateRule,
    activateRule,
    deactivateRule,
    deleteRule,
    type Rule,
    type CreateRuleDto,
    type UpdateRuleDto,
    type UserRole,
} from "@/actions/rules";

// ============ Query Keys ============

export const ruleKeys = {
    all: ["rules"] as const,
    lists: () => [...ruleKeys.all, "list"] as const,
    list: (role?: UserRole, activeOnly?: boolean) => [...ruleKeys.lists(), { role, activeOnly }] as const,
    details: () => [...ruleKeys.all, "detail"] as const,
    detail: (id: string) => [...ruleKeys.details(), id] as const,
};

// ============ Queries ============

export function useRulesQuery(role?: UserRole, activeOnly?: boolean) {
    return useQuery<Rule[], Error>({
        queryKey: ruleKeys.list(role, activeOnly),
        queryFn: () => getRules(role, activeOnly),
        staleTime: 5 * 60 * 1000,
    });
}

export function useRuleQuery(id: string) {
    return useQuery<Rule, Error>({
        queryKey: ruleKeys.detail(id),
        queryFn: () => getRuleById(id),
        enabled: !!id,
    });
}

// ============ Mutations ============

export function useCreateRule() {
    const queryClient = useQueryClient();
    return useMutation<Rule, Error, CreateRuleDto>({
        mutationFn: createRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.all });
            toast.success("Règle créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateRule() {
    const queryClient = useQueryClient();
    return useMutation<Rule, Error, { id: string; data: UpdateRuleDto }>({
        mutationFn: ({ id, data }) => updateRule(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.all });
            queryClient.invalidateQueries({ queryKey: ruleKeys.detail(id) });
            toast.success("Règle mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useActivateRule() {
    const queryClient = useQueryClient();
    return useMutation<Rule, Error, string>({
        mutationFn: activateRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.all });
            toast.success("Règle activée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'activation");
        },
    });
}

export function useDeactivateRule() {
    const queryClient = useQueryClient();
    return useMutation<Rule, Error, string>({
        mutationFn: deactivateRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.all });
            toast.success("Règle désactivée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la désactivation");
        },
    });
}

export function useDeleteRule() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.all });
            toast.success("Règle supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
