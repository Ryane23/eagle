import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FileEntity, FileEntityType } from "@/types/api";
import {
    uploadFile,
    getFileById,
    deleteFile,
    getFilesByEntity,
    getMyFiles,
} from "@/actions/files";

// Query Keys
export const fileKeys = {
    all: ["files"] as const,
    lists: () => [...fileKeys.all, "list"] as const,
    myFiles: () => [...fileKeys.all, "my"] as const,
    byEntity: (entityType: FileEntityType, entityId: string) =>
        [...fileKeys.all, "entity", entityType, entityId] as const,
    details: () => [...fileKeys.all, "detail"] as const,
    detail: (id: string) => [...fileKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get files uploaded by current user
 */
export function useMyFilesQuery() {
    return useQuery<FileEntity[], Error>({
        queryKey: fileKeys.myFiles(),
        queryFn: getMyFiles,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get file by ID
 */
export function useFileQuery(id: string) {
    return useQuery<FileEntity, Error>({
        queryKey: fileKeys.detail(id),
        queryFn: () => getFileById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // Files don't change
        gcTime: 60 * 60 * 1000,
    });
}

/**
 * Get files by related entity (e.g., patient, consultation)
 */
export function useFilesByEntityQuery(entityType: FileEntityType, entityId: string) {
    return useQuery<FileEntity[], Error>({
        queryKey: fileKeys.byEntity(entityType, entityId),
        queryFn: () => getFilesByEntity(entityType, entityId),
        enabled: !!entityType && !!entityId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Upload a file
 */
export function useUploadFile() {
    const queryClient = useQueryClient();

    return useMutation<
        FileEntity,
        Error,
        { file: File; entityType?: FileEntityType; entityId?: string }
    >({
        mutationFn: ({ file, entityType, entityId }) =>
            uploadFile(file, entityType, entityId),
        onSuccess: (newFile, { entityType, entityId }) => {
            queryClient.setQueryData(fileKeys.detail(newFile.id), newFile);
            queryClient.invalidateQueries({ queryKey: fileKeys.myFiles() });
            if (entityType && entityId) {
                queryClient.invalidateQueries({
                    queryKey: fileKeys.byEntity(entityType, entityId),
                });
            }
            toast.success("Fichier téléchargé avec succès");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du téléchargement");
        },
    });
}

/**
 * Delete a file
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteFile,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: fileKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: fileKeys.myFiles() });
            queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
            toast.success("Fichier supprimé");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

