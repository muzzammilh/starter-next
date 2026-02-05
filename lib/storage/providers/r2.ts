/**
 * Cloudflare R2 Storage Provider
 * 
 * Stores files in Cloudflare R2 with zero egress fees
 * S3-compatible API using AWS SDK v3
 * 
 * Setup:
 * 1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * 2. Create R2 bucket in Cloudflare dashboard
 * 3. Generate API token (Access Key ID + Secret Access Key)
 * 4. Set environment variables (see .env.example)
 * 5. Set STORAGE_PROVIDER=r2
 * 
 * Features:
 * - Zero egress bandwidth costs
 * - S3-compatible API
 * - Global edge network (330+ data centers)
 * - Jurisdictional data residency (EU, FedRAMP)
 * - Custom domain support
 * - Presigned URLs for private access
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

export class R2StorageProvider implements StorageProvider {
  name = 'r2';
  private r2Client: any;
  private bucket: string;
  private accountId: string;
  private publicDomain?: string;
  private jurisdiction: string;
  private initialized = false;

  constructor() {
    this.accountId = storageConfig.r2.accountId;
    this.bucket = storageConfig.r2.bucketName;
    this.publicDomain = storageConfig.r2.publicDomain;
    this.jurisdiction = storageConfig.r2.jurisdiction;

    if (!this.accountId) {
      throw new StorageError(
        'R2 account ID not configured. Set R2_ACCOUNT_ID environment variable.',
        'R2_CONFIG_ERROR',
        500
      );
    }

    if (!this.bucket) {
      throw new StorageError(
        'R2 bucket name not configured. Set R2_BUCKET_NAME environment variable.',
        'R2_CONFIG_ERROR',
        500
      );
    }

    if (!storageConfig.r2.accessKeyId || !storageConfig.r2.secretAccessKey) {
      throw new StorageError(
        'R2 credentials not configured. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables.',
        'R2_CONFIG_ERROR',
        500
      );
    }
  }

  /**
   * Initialize R2 client
   */
  private async initializeClient(): Promise<void> {
    if (this.initialized) return;

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');

      const endpoint = this.buildEndpoint();

      this.r2Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: storageConfig.r2.accessKeyId,
          secretAccessKey: storageConfig.r2.secretAccessKey,
        },
      });

      this.initialized = true;
      logger.info({ accountId: this.accountId, bucket: this.bucket, endpoint }, 'R2 client initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize R2 client');
      throw new StorageError(
        'Failed to initialize R2 client. Make sure @aws-sdk/client-s3 is installed.',
        'R2_INIT_ERROR',
        500
      );
    }
  }

  /**
   * Build R2 endpoint URL based on jurisdiction
   */
  private buildEndpoint(): string {
    const { jurisdiction, accountId } = this;

    switch (jurisdiction) {
      case 'eu':
        return `https://${accountId}.eu.r2.cloudflarestorage.com`;
      case 'fedramp':
        return `https://${accountId}.fedramp.r2.cloudflarestorage.com`;
      case 'auto':
      default:
        return `https://${accountId}.r2.cloudflarestorage.com`;
    }
  }

  /**
   * Upload a file
   */
  async upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    try {
      await this.initializeClient();

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

      const originalFilename = file instanceof File ? file.name : 'file';
      const filename = options?.filename
        ? sanitizeFilename(options.filename + getFileExtension(originalFilename))
        : generateUniqueFilename(originalFilename);

      const folder = options?.folder || storageConfig.defaults.folder;
      const key = buildFilePath(filename, folder);

      const buffer = file instanceof File ? await fileToBuffer(file) : file;

      const { PutObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file instanceof File ? file.type : 'application/octet-stream',
        Metadata: options?.metadata,
      });

      await this.r2Client.send(command);

      const url = this.buildUrl(key);

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
        { filename, size: buffer.length, key, provider: 'r2' },
        'File uploaded to R2 successfully'
      );

      return result;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      logger.error({ error }, 'Failed to upload file to R2');
      throw new StorageError(
        'Failed to upload file to R2',
        'R2_UPLOAD_ERROR',
        500
      );
    }
  }

  /**
   * Delete a file
   */
  async delete(options: DeleteOptions): Promise<void> {
    try {
      await this.initializeClient();

      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: options.path,
      });

      await this.r2Client.send(command);

      logger.info({ key: options.path, provider: 'r2' }, 'File deleted from R2 successfully');
    } catch (error) {
      logger.error({ error, key: options.path, provider: 'r2' }, 'Failed to delete file from R2');
      throw new StorageError(
        'Failed to delete file from R2',
        'R2_DELETE_ERROR',
        500
      );
    }
  }

  /**
   * Get file URL (public or signed)
   */
  async getUrl(options: GetUrlOptions): Promise<string> {
    try {
      await this.initializeClient();

      if (options.expiresIn) {
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: options.path,
        });

        const url = await getSignedUrl(this.r2Client, command, {
          expiresIn: options.expiresIn,
        });

        return url;
      }

      return this.buildUrl(options.path);
    } catch (error) {
      logger.error({ error, key: options.path, provider: 'r2' }, 'Failed to get R2 URL');
      throw new StorageError(
        'Failed to get file URL',
        'R2_GET_URL_ERROR',
        500
      );
    }
  }

  /**
   * Build public URL for a file
   */
  private buildUrl(key: string): string {
    if (this.publicDomain) {
      return `${this.publicDomain}/${key}`;
    }

    const endpoint = this.buildEndpoint();
    return `${endpoint}/${this.bucket}/${key}`;
  }

  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      await this.initializeClient();

      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.r2Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
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
      await this.initializeClient();

      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.r2Client.send(command);

      return {
        path,
        size: response.ContentLength,
        mimeType: response.ContentType,
        url: this.buildUrl(path),
        provider: this.name,
        uploadedAt: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }

      logger.error({ error, key: path, provider: 'r2' }, 'Failed to get R2 metadata');
      return null;
    }
  }
}
