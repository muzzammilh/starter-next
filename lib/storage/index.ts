/**
 * Storage System
 *
 * Provider-agnostic file storage with support for local, S3, Cloudinary, and R2
 *
 * @example Basic usage
 * ```typescript
 * import { storage } from '@/lib/storage';
 *
 * // Upload a file
 * const result = await storage.upload(file);
 * console.log(result.url);
 *
 * // Delete a file
 * await storage.delete({ path: result.path });
 * ```
 *
 * @example With options
 * ```typescript
 * import { storage, storagePresets } from '@/lib/storage';
 *
 * // Upload an avatar
 * const result = await storage.upload(file, storagePresets.avatar);
 *
 * // Upload with custom options
 * const result = await storage.upload(file, {
 *   folder: 'documents',
 *   maxSize: 20 * 1024 * 1024, // 20MB
 *   allowedTypes: ['application/pdf'],
 * });
 * ```
 */

import { StorageProvider } from './types';
import { LocalStorageProvider } from './providers/local';
import { S3StorageProvider } from './providers/s3';
import { CloudinaryStorageProvider } from './providers/cloudinary';
import { R2StorageProvider } from './providers/r2';
import { storageConfig } from './config';
import { logger } from '@/lib/logger';

/**
 * Get the configured storage provider
 */
function getStorageProvider(): StorageProvider {
  const providerName = storageConfig.provider;

  logger.debug({ provider: providerName }, 'Initializing storage provider');

  switch (providerName) {
    case 'local':
      return new LocalStorageProvider();
    case 's3':
      return new S3StorageProvider();
    case 'cloudinary':
      return new CloudinaryStorageProvider();
    case 'r2':
      return new R2StorageProvider();
    default:
      logger.warn(
        { provider: providerName },
        'Unknown storage provider, falling back to local'
      );
      return new LocalStorageProvider();
  }
}

/**
 * Storage instance (singleton)
 */
export const storage = getStorageProvider();

/**
 * Re-export types and utilities
 */
export * from './types';
export * from './utils';
export { storageConfig, storagePresets } from './config';
