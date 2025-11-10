/**
 * Storage Utilities
 * 
 * Helper functions for file validation and manipulation
 */

import { StorageError, ValidationError, UploadOptions } from './types';
import { storageConfig } from './config';

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalFilename);
  return `${timestamp}-${random}${extension}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
}

/**
 * Sanitize filename (remove special characters)
 */
export function sanitizeFilename(filename: string): string {
  const extension = getFileExtension(filename);
  const nameWithoutExt = getFilenameWithoutExtension(filename);
  
  // Replace spaces with hyphens and remove special characters
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
  
  return `${sanitized}${extension}`;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): ValidationError | null {
  if (size > maxSize) {
    return {
      field: 'file',
      message: `File size exceeds maximum allowed size of ${formatBytes(maxSize)}`,
    };
  }
  return null;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: readonly string[] | string[]
): ValidationError | null {
  if (!allowedTypes.includes(mimeType)) {
    return {
      field: 'file',
      message: `File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  return null;
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File | { size: number; type: string },
  options?: UploadOptions
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Determine max size based on file type if not explicitly provided
  let maxSize = options?.maxSize;
  if (!maxSize) {
    // Use image size limit for images, otherwise use general file size limit
    maxSize = isImage(file.type)
      ? storageConfig.limits.maxImageSize
      : storageConfig.limits.maxFileSize;
  }
  
  const allowedTypes = options?.allowedTypes || [...storageConfig.defaults.allowedTypes];
  
  // Validate size
  const sizeError = validateFileSize(file.size, maxSize);
  if (sizeError) errors.push(sizeError);
  
  // Validate type
  const typeError = validateFileType(file.type, allowedTypes);
  if (typeError) errors.push(typeError);
  
  return errors;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Check if file is a document
 */
export function isDocument(mimeType: string): boolean {
  return (
    mimeType.startsWith('application/pdf') ||
    mimeType.startsWith('application/msword') ||
    mimeType.startsWith('application/vnd.openxmlformats-officedocument')
  );
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Convert File to Buffer (for Node.js environments)
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Build file path with folder
 */
export function buildFilePath(filename: string, folder?: string): string {
  if (!folder) return filename;
  
  // Remove leading/trailing slashes from folder
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  
  return `${cleanFolder}/${filename}`;
}
