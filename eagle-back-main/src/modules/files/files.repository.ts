import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { File, FileCollection } from './entities/file.entity';

@Injectable()
export class FilesRepository extends BaseRepository<File> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, FileCollection);
  }

  /**
   * Find files by related entity
   */
  async findByRelatedEntity(
    entityType: string,
    entityId: string,
  ): Promise<File[]> {
    const querySnapshot = await this.collection
      .where('relatedEntityType', '==', entityType)
      .where('relatedEntityId', '==', entityId)
      .where('isActive', '==', true)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<File, 'id'>,
    }));
  }

  /**
   * Find files by uploader
   */
  async findByUploader(uploadedBy: string): Promise<File[]> {
    const querySnapshot = await this.collection
      .where('uploadedBy', '==', uploadedBy)
      .where('isActive', '==', true)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<File, 'id'>,
    }));
  }
}

