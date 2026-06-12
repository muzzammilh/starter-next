/**
 * AWS S3 Storage Provider
 * 
 * Stores files in Amazon S3 or S3-compatible services
 * Recommended for production deployments
 * 
 * Setup:
 * 1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * 2. Set environment variables (see .env.example)
 * 3. Set STORAGE_PROVIDER=s3
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
  buildFilePath,
  getFileExtension,
} from '../utils';
import { storageConfig } from '../config';
import { logger } from '@/lib/logger';

export class S3StorageProvider implements StorageProvider {
  name = 's3';
  private s3Client: any;
  private bucket: string;
  
  constructor() {
    this.bucket = storageConfig.s3.bucket;
    
    if (!this.bucket) {
      throw new StorageError(
        'S3 bucket not configured. Set AWS_S3_BUCKET environment variable.',
        'S3_CONFIG_ERROR',
        500
      );
    }
    
    // Initialize S3 client (lazy loaded)
    this.initializeClient();
  }
  
  /**
   * Initialize S3 client
   */
  private async initializeClient(): Promise<void> {
    try {
      // Dynamically import AWS SDK (only when S3 is used)
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      this.s3Client = new S3Client({
        region: storageConfig.s3.region,
        credentials: {
          accessKeyId: storageConfig.s3.accessKeyId,
          secretAccessKey: storageConfig.s3.secretAccessKey,
        },
        ...(storageConfig.s3.endpoint && { endpoint: storageConfig.s3.endpoint }),
      });
      
      logger.info('S3 client initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize S3 client');
      throw new StorageError(
        'Failed to initialize S3 client. Make sure @aws-sdk/client-s3 is installed.',
        'S3_INIT_ERROR',
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
      
      // Build file path (S3 key)
      const folder = options?.folder || storageConfig.defaults.folder;
      const key = buildFilePath(filename, folder);
      
      // Convert File to Buffer if needed
      const buffer = file instanceof File ? await fileToBuffer(file) : file;
      
      // Upload to S3
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file instanceof File ? file.type : 'application/octet-stream',
        Metadata: options?.metadata,
        ...(options?.public !== false && { ACL: 'public-read' }),
      });
      
      await this.s3Client.send(command);
      
      // Build public URL
      const url = options?.public !== false
        ? `https://${this.bucket}.s3.${storageConfig.s3.region}.amazonaws.com/${key}`
        : key; // For private files, return key (use getUrl to get signed URL)
      
      const result: UploadResult = {
        id: filename,
        filename: originalFilename,
        size: buffer.length,
        mimeType: file instanceof File ? file.type : 'application/octet-stream',
        url,
        path: key,
        provider: this.name,
        uploadedAt: new Date(),
        metadata: options?.metadata,
      };
      
      logger.info(
        { filename, size: buffer.length, key },
        'File uploaded to S3 successfully'
      );
      
      return result;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      logger.error({ error }, 'Failed to upload file to S3');
      throw new StorageError(
        'Failed to upload file to S3',
        'S3_UPLOAD_ERROR',
        500
      );
    }
  }
  
  /**
   * Delete a file
   */
  async delete(options: DeleteOptions): Promise<void> {
    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: options.path,
      });
      
      await this.s3Client.send(command);
      
      logger.info({ key: options.path }, 'File deleted from S3 successfully');
    } catch (error) {
      logger.error({ error, key: options.path }, 'Failed to delete file from S3');
      throw new StorageError(
        'Failed to delete file from S3',
        'S3_DELETE_ERROR',
        500
      );
    }
  }
  
  /**
   * Get file URL (signed URL for private files)
   */
  async getUrl(options: GetUrlOptions): Promise<string> {
    try {
      // For public files, return direct URL
      if (!options.expiresIn) {
        return `https://${this.bucket}.s3.${storageConfig.s3.region}.amazonaws.com/${options.path}`;
      }
      
      // For private files, generate signed URL
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: options.path,
      });
      
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: options.expiresIn,
      });
      
      return url;
    } catch (error) {
      logger.error({ error, key: options.path }, 'Failed to get S3 URL');
      throw new StorageError(
        'Failed to get file URL',
        'S3_GET_URL_ERROR',
        500
      );
    }
  }
  
  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });
      
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
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
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });
      
      const response = await this.s3Client.send(command);
      
      return {
        path,
        size: response.ContentLength,
        mimeType: response.ContentType,
        url: `https://${this.bucket}.s3.${storageConfig.s3.region}.amazonaws.com/${path}`,
        provider: this.name,
        uploadedAt: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return null;
      }
      
      logger.error({ error, key: path }, 'Failed to get S3 metadata');
      return null;
    }
  }
}
