import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FilesRepository } from './files.repository';
import { File } from './entities/file.entity';
import { FirebaseService } from '../../config/firebase';
import { UploadFileDto } from './dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Upload file to Firebase Storage
   */
  async upload(
    file: Express.Multer.File,
    uploadedBy: string,
    uploadDto?: UploadFileDto,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const storagePath = `files/${uploadDto?.relatedEntityType || 'other'}/${uniqueFileName}`;

    // Upload to Firebase Storage
    const bucket = this.firebaseService.getStorage().bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy,
        },
      },
    });

    // Make file publicly accessible (or use signed URLs for private files)
    await fileRef.makePublic();

    // Get public URL
    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Save file metadata to Firestore
    const fileData: Partial<File> = {
      fileName: uniqueFileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      uploadedBy,
      relatedEntityType: uploadDto?.relatedEntityType || null,
      relatedEntityId: uploadDto?.relatedEntityId || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.filesRepository.create(fileData);
  }

  /**
   * Get file by ID
   */
  async findById(id: string): Promise<File> {
    const file = await this.filesRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    if (!file.isActive) {
      throw new NotFoundException(`File with ID ${id} is not active`);
    }
    return file;
  }

  /**
   * Get files by related entity
   */
  async findByRelatedEntity(
    entityType: string,
    entityId: string,
  ): Promise<File[]> {
    return await this.filesRepository.findByRelatedEntity(entityType, entityId);
  }

  /**
   * Get files uploaded by user
   */
  async findByUploader(uploadedBy: string): Promise<File[]> {
    return await this.filesRepository.findByUploader(uploadedBy);
  }

  /**
   * Delete file (soft delete)
   */
  async delete(id: string): Promise<void> {
    const file = await this.findById(id);

    // Delete from Firebase Storage
    const bucket = this.firebaseService.getStorage().bucket();
    const storagePath = `files/${file.relatedEntityType || 'other'}/${file.fileName}`;
    const fileRef = bucket.file(storagePath);

    try {
      await fileRef.delete();
    } catch (error) {
      // File might not exist in storage, continue with soft delete
    }

    // Soft delete in Firestore
    await this.filesRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }
}

