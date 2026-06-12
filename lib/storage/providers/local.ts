/**
 * Local Storage Provider
 * 
 * Stores files in the local filesystem (public/uploads by default)
 * Suitable for development and single-server deployments
 * 
 * ⚠️ Not recommended for serverless deployments (Vercel, AWS Lambda, etc.)
 * Use S3 or Cloudinary for production serverless environments
 */

import { writeFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  DeleteOptions,
  GetUrlOptions,
  StorageError,
} from '../types';
import {
  generateUniqueFilename,
  sanitizeFilename,
  validateFile,
  fileToBuffer,
  buildFilePath,
  getFileExtension,
} from '../utils';
import { storageConfig } from '../config';
import { logger } from '@/lib/logger';

export class LocalStorageProvider implements StorageProvider {
  name = 'local';
  private uploadDir: string;
  private baseUrl: string;
  
  constructor() {
    this.uploadDir = storageConfig.local.uploadDir;
    this.baseUrl = storageConfig.local.baseUrl;
    
    // Ensure upload directory exists
    this.ensureUploadDir();
  }
  
  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      if (!existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true });
        logger.info({ dir: this.uploadDir }, 'Created upload directory');
      }
    } catch (error) {
      logger.error({ error, dir: this.uploadDir }, 'Failed to create upload directory');
      throw new StorageError(
        'Failed to initialize storage directory',
        'STORAGE_INIT_ERROR',
        500
      );
    }
  }
  
  /**
   * Upload a file
   */
  async upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    try {
      // Validate file if it's a File object
      if (file instanceof File) {
        const validationErrors = validateFile(file, options);
        if (validationErrors.length > 0) {
          throw new StorageError(
            validationErrors[0].message,
            'VALIDATION_ERROR',
            400
          );
        }
      }
      
      // Generate filename
      const originalFilename = file instanceof File ? file.name : 'file';
      const filename = options?.filename
        ? sanitizeFilename(options.filename + getFileExtension(originalFilename))
        : generateUniqueFilename(originalFilename);
      
      // Build file path
      const folder = options?.folder || storageConfig.defaults.folder;
      const relativePath = buildFilePath(filename, folder);
      const fullPath = path.join(this.uploadDir, relativePath);
      
      // Ensure folder exists
      const folderPath = path.dirname(fullPath);
      if (!existsSync(folderPath)) {
        await mkdir(folderPath, { recursive: true });
      }
      
      // Convert File to Buffer if needed
      const buffer = file instanceof File ? await fileToBuffer(file) : file;
      
      // Write file
      await writeFile(fullPath, buffer);
      
      // Get file stats
      const stats = await stat(fullPath);
      
      // Build public URL
      const url = `${this.baseUrl}/uploads/${relativePath}`;
      
      const result: UploadResult = {
        id: filename,
        filename: originalFilename,
        size: stats.size,
        mimeType: file instanceof File ? file.type : 'application/octet-stream',
        url,
        path: relativePath,
        provider: this.name,
        uploadedAt: new Date(),
        metadata: options?.metadata,
      };
      
      logger.info(
        { filename, size: stats.size, path: relativePath },
        'File uploaded successfully'
      );
      
      return result;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      logger.error({ error }, 'Failed to upload file');
      throw new StorageError(
        'Failed to upload file',
        'UPLOAD_ERROR',
        500
      );
    }
  }
  
  /**
   * Delete a file
   */
  async delete(options: DeleteOptions): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, options.path);
      
      if (!existsSync(fullPath)) {
        throw new StorageError(
          'File not found',
          'FILE_NOT_FOUND',
          404
        );
      }
      
      await unlink(fullPath);
      
      logger.info({ path: options.path }, 'File deleted successfully');
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      logger.error({ error, path: options.path }, 'Failed to delete file');
      throw new StorageError(
        'Failed to delete file',
        'DELETE_ERROR',
        500
      );
    }
  }
  
  /**
   * Get file URL
   */
  async getUrl(options: GetUrlOptions): Promise<string> {
    const url = `${this.baseUrl}/uploads/${options.path}`;
    return url;
  }
  
  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, filePath);
    return existsSync(fullPath);
  }
  
  /**
   * Get file metadata
   */
  async getMetadata(filePath: string): Promise<Partial<UploadResult> | null> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      
      if (!existsSync(fullPath)) {
        return null;
      }
      
      const stats = await stat(fullPath);
      const url = `${this.baseUrl}/uploads/${filePath}`;
      
      return {
        path: filePath,
        size: stats.size,
        url,
        provider: this.name,
        uploadedAt: stats.birthtime,
      };
    } catch (error) {
      logger.error({ error, path: filePath }, 'Failed to get file metadata');
      return null;
    }
  }
}
