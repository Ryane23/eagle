import {
  Injectable,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import {
  SyncOperation,
  SyncOperationType,
  SyncStatus,
  SyncOperationCollection,
} from './entities/sync-operation.entity';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Queue an operation for synchronization
   */
  async queueOperation(
    userId: string,
    entityType: string,
    entityId: string,
    operationType: SyncOperationType,
    data: Record<string, any>,
  ): Promise<SyncOperation> {
    const syncOp: Omit<SyncOperation, 'id'> = {
      userId,
      entityType,
      entityId,
      operationType,
      data,
      status: SyncStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
    };

    const docRef = await this.firebaseService
      .collection(SyncOperationCollection)
      .add(syncOp);

    return {
      id: docRef.id,
      ...syncOp,
    };
  }

  /**
   * Sync pending operations
   */
  async syncPendingOperations(userId: string): Promise<{
    synced: number;
    failed: number;
    conflicts: number;
  }> {
    const pendingOps = await this.getPendingOperations(userId);
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const op of pendingOps) {
      try {
        const result = await this.syncOperation(op);
        if (result.status === SyncStatus.SYNCED) {
          synced++;
        } else if (result.status === SyncStatus.CONFLICT) {
          conflicts++;
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to sync operation ${op.id}: ${error.message}`,
        );
        await this.markOperationFailed(op.id, error.message);
        failed++;
      }
    }

    return { synced, failed, conflicts };
  }

  /**
   * Sync a single operation
   */
  private async syncOperation(
    operation: SyncOperation,
  ): Promise<SyncOperation> {
    const collection = this.firebaseService.collection(operation.entityType);
    const serverDoc = await collection.doc(operation.entityId).get();

    // Check for conflicts (last-write-wins with timestamps)
    if (serverDoc.exists) {
      const serverData = serverDoc.data();
      const serverTimestamp = serverData?.updatedAt?.toMillis() || 0;
      const clientTimestamp = operation.data?.updatedAt?.toMillis() || 0;

      if (serverTimestamp > clientTimestamp) {
        // Server version is newer - conflict
        return await this.handleConflict(operation, serverData);
      }
    }

    // Apply operation
    try {
      switch (operation.operationType) {
        case SyncOperationType.CREATE:
          await collection.doc(operation.entityId).set(operation.data);
          break;
        case SyncOperationType.UPDATE:
          await collection.doc(operation.entityId).update(operation.data);
          break;
        case SyncOperationType.DELETE:
          await collection.doc(operation.entityId).delete();
          break;
      }

      // Mark as synced
      await this.markOperationSynced(operation.id);
      return {
        ...operation,
        status: SyncStatus.SYNCED,
        syncedAt: new Date(),
      };
    } catch (error) {
      await this.markOperationFailed(operation.id, error.message);
      throw error;
    }
  }

  /**
   * Handle conflict resolution
   */
  private async handleConflict(
    operation: SyncOperation,
    serverData: any,
  ): Promise<SyncOperation> {
    // Last-write-wins: use server version
    await this.firebaseService
      .collection(SyncOperationCollection)
      .doc(operation.id)
      .update({
        status: SyncStatus.CONFLICT,
        serverVersion: serverData,
        clientVersion: operation.data,
        conflictResolution: 'server',
      });

    return {
      ...operation,
      status: SyncStatus.CONFLICT,
      serverVersion: serverData,
      clientVersion: operation.data,
      conflictResolution: 'server',
    };
  }

  /**
   * Get pending operations for a user
   */
  async getPendingOperations(userId: string): Promise<SyncOperation[]> {
    const snapshot = await this.firebaseService
      .collection(SyncOperationCollection)
      .where('userId', '==', userId)
      .where('status', '==', SyncStatus.PENDING)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<SyncOperation, 'id'>,
    }));
  }

  /**
   * Mark operation as synced
   */
  private async markOperationSynced(operationId: string): Promise<void> {
    await this.firebaseService
      .collection(SyncOperationCollection)
      .doc(operationId)
      .update({
        status: SyncStatus.SYNCED,
        syncedAt: new Date(),
      });
  }

  /**
   * Mark operation as failed
   */
  private async markOperationFailed(
    operationId: string,
    errorMessage: string,
  ): Promise<void> {
    const opDoc = await this.firebaseService
      .collection(SyncOperationCollection)
      .doc(operationId)
      .get();

    const op = opDoc.data() as SyncOperation;
    const retryCount = (op?.retryCount || 0) + 1;

    await this.firebaseService
      .collection(SyncOperationCollection)
      .doc(operationId)
      .update({
        status: retryCount >= 3 ? SyncStatus.FAILED : SyncStatus.PENDING,
        errorMessage,
        retryCount,
      });
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    operationId: string,
    resolution: 'server' | 'client' | 'merge',
    mergedData?: Record<string, any>,
  ): Promise<SyncOperation> {
    const opDoc = await this.firebaseService
      .collection(SyncOperationCollection)
      .doc(operationId)
      .get();

    if (!opDoc.exists) {
      throw new ConflictException(`Sync operation ${operationId} not found`);
    }

    const operation = { id: opDoc.id, ...opDoc.data() } as SyncOperation;

    if (resolution === 'server') {
      // Use server version - mark as synced
      await this.markOperationSynced(operationId);
      return { ...operation, status: SyncStatus.SYNCED };
    } else if (resolution === 'client') {
      // Use client version - retry sync
      await this.firebaseService
        .collection(SyncOperationCollection)
        .doc(operationId)
        .update({
          status: SyncStatus.PENDING,
          data: operation.clientVersion || operation.data,
        });
      return await this.syncOperation({ ...operation, status: SyncStatus.PENDING });
    } else {
      // Merge - use provided merged data
      if (!mergedData) {
        throw new ConflictException('Merged data is required for merge resolution');
      }
      await this.firebaseService
        .collection(SyncOperationCollection)
        .doc(operationId)
        .update({
          status: SyncStatus.PENDING,
          data: mergedData,
        });
      return await this.syncOperation({ ...operation, data: mergedData, status: SyncStatus.PENDING });
    }
  }
}

