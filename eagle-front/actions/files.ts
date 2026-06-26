import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { FileEntity, FileEntityType } from "@/types/api";

/**
 * Upload a file
 */
export async function uploadFile(
  file: File,
  relatedEntityType?: FileEntityType,
  relatedEntityId?: string
): Promise<FileEntity> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (relatedEntityType) {
      formData.append("relatedEntityType", relatedEntityType);
    }
    if (relatedEntityId) {
      formData.append("relatedEntityId", relatedEntityId);
    }

    const response = await apiClient.post<FileEntity>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get file by ID
 */
export async function getFileById(id: string): Promise<FileEntity> {
  try {
    const response = await apiClient.get<FileEntity>(`/files/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a file
 */
export async function deleteFile(id: string): Promise<void> {
  try {
    await apiClient.delete(`/files/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get files by related entity
 */
export async function getFilesByEntity(
  entityType: FileEntityType,
  entityId: string
): Promise<FileEntity[]> {
  try {
    const response = await apiClient.get<FileEntity[]>(`/files/entity/${entityType}/${entityId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get my files - Files uploaded by the current user
 */
export async function getMyFiles(): Promise<FileEntity[]> {
  try {
    const response = await apiClient.get<FileEntity[]>("/files/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
