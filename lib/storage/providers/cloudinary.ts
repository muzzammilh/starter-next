/**
 * Cloudinary Storage Provider
 * 
 * Stores files in Cloudinary with automatic image optimization
 * Great for images and videos with built-in transformations
 * 
 * Setup:
 * 1. npm install cloudinary
 * 2. Set environment variables (see .env.example)
 * 3. Set STORAGE_PROVIDER=cloudinary
 */

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
  getFileExtension,
} from '../utils';
import { storageConfig } from '../config';
import { logger } from '@/lib/logger';

export class CloudinaryStorageProvider implements StorageProvider {
  name = 'cloudinary';
  private cloudinary: any;
  
  constructor() {
    if (!storageConfig.cloudinary.cloudName) {
      throw new StorageError(
        'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME environment variable.',
        'CLOUDINARY_CONFIG_ERROR',
        500
      );
    }
    
    this.initializeClient();
  }
  
  /**
   * Initialize Cloudinary client
   */
  private async initializeClient(): Promise<void> {
    try {
      // Dynamically import Cloudinary (only when used)
      const cloudinary = await import('cloudinary');
      
      cloudinary.v2.config({
        cloud_name: storageConfig.cloudinary.cloudName,
        api_key: storageConfig.cloudinary.apiKey,
        api_secret: storageConfig.cloudinary.apiSecret,
      });
      
      this.cloudinary = cloudinary.v2;
      
      logger.info('Cloudinary client initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Cloudinary client');
      throw new StorageError(
        'Failed to initialize Cloudinary client. Make sure cloudinary is installed.',
        'CLOUDINARY_INIT_ERROR',
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
      
      // Remove extension for Cloudinary public_id
      const publicId = filename.replace(/\.[^/.]+$/, '');
      
      // Build folder path
      const folder = options?.folder || storageConfig.cloudinary.folder;
      const fullPublicId = folder ? `${folder}/${publicId}` : publicId;
      
      // Convert File to Buffer if needed
      const buffer = file instanceof File ? await fileToBuffer(file) : file;
      
      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            public_id: fullPublicId,
            resource_type: 'auto', // Auto-detect resource type
            context: options?.metadata,
            ...(options?.public === false && { type: 'private' }),
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(buffer);
      });
      
      const uploadResult: UploadResult = {
        id: result.public_id,
        filename: originalFilename,
        size: result.bytes,
        mimeType: file instanceof File ? file.type : 'application/octet-stream',
        url: result.secure_url,
        path: result.public_id,
        provider: this.name,
        uploadedAt: new Date(),
        metadata: options?.metadata,
      };
      
      logger.info(
        { filename, size: result.bytes, publicId: result.public_id },
        'File uploaded to Cloudinary successfully'
      );
      
      return uploadResult;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      logger.error({ error }, 'Failed to upload file to Cloudinary');
      throw new StorageError(
        'Failed to upload file to Cloudinary',
        'CLOUDINARY_UPLOAD_ERROR',
        500
      );
    }
  }
  
  /**
   * Delete a file
   */
  async delete(options: DeleteOptions): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(options.path);
      
      logger.info({ publicId: options.path }, 'File deleted from Cloudinary successfully');
    } catch (error) {
      logger.error({ error, publicId: options.path }, 'Failed to delete file from Cloudinary');
      throw new StorageError(
        'Failed to delete file from Cloudinary',
        'CLOUDINARY_DELETE_ERROR',
        500
      );
    }
  }
  
  /**
   * Get file URL (with optional transformations)
   */
  async getUrl(options: GetUrlOptions): Promise<string> {
    try {
      // For signed URLs (private files)
      if (options.expiresIn) {
        const expiresAt = Math.floor(Date.now() / 1000) + options.expiresIn;
        
        return this.cloudinary.url(options.path, {
          sign_url: true,
          type: 'private',
          expires_at: expiresAt,
        });
      }
      
      // For public URLs
      return this.cloudinary.url(options.path, {
        secure: true,
      });
    } catch (error) {
      logger.error({ error, publicId: options.path }, 'Failed to get Cloudinary URL');
      throw new StorageError(
        'Failed to get file URL',
        'CLOUDINARY_GET_URL_ERROR',
        500
      );
    }
  }
  
  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      await this.cloudinary.api.resource(path);
      return true;
    } catch (error: any) {
      if (error.http_code === 404) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<Partial<UploadResult> | null> {
    try {
      const resource = await this.cloudinary.api.resource(path);
      
      return {
        path: resource.public_id,
        size: resource.bytes,
        mimeType: resource.format,
        url: resource.secure_url,
        provider: this.name,
        uploadedAt: new Date(resource.created_at),
        metadata: resource.context?.custom,
      };
    } catch (error: any) {
      if (error.http_code === 404) {
        return null;
      }
      
      logger.error({ error, publicId: path }, 'Failed to get Cloudinary metadata');
      return null;
    }
  }
}
