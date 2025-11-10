/**
 * Storage System Types
 * 
 * Provider-agnostic types for file storage operations
 */

export interface UploadOptions {
  /**
   * Maximum file size in bytes
   * @default 10MB
   */
  maxSize?: number;
  
  /**
   * Allowed MIME types
   * @example ['image/jpeg', 'image/png', 'application/pdf']
   */
  allowedTypes?: string[];
  
  /**
   * Custom filename (without extension)
   * If not provided, a unique name will be generated
   */
  filename?: string;
  
  /**
   * Folder/prefix for organizing files
   * @example 'avatars', 'documents/invoices'
   */
  folder?: string;
  
  /**
   * Whether to make the file publicly accessible
   * @default true
   */
  public?: boolean;
  
  /**
   * Additional metadata to store with the file
   */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /**
   * Unique identifier for the file
   */
  id: string;
  
  /**
   * Original filename
   */
  filename: string;
  
  /**
   * File size in bytes
   */
  size: number;
  
  /**
   * MIME type
   */
  mimeType: string;
  
  /**
   * Public URL to access the file
   */
  url: string;
  
  /**
   * Storage path/key (provider-specific)
   */
  path: string;
  
  /**
   * Storage provider used
   */
  provider: string;
  
  /**
   * Upload timestamp
   */
  uploadedAt: Date;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, string>;
}

export interface DeleteOptions {
  /**
   * File path or ID to delete
   */
  path: string;
}

export interface GetUrlOptions {
  /**
   * File path or ID
   */
  path: string;
  
  /**
   * Expiration time for signed URLs (in seconds)
   * Only applicable for private files
   */
  expiresIn?: number;
}

/**
 * Storage Provider Interface
 * All storage providers must implement this interface
 */
export interface StorageProvider {
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Upload a file
   */
  upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult>;
  
  /**
   * Delete a file
   */
  delete(options: DeleteOptions): Promise<void>;
  
  /**
   * Get file URL (public or signed)
   */
  getUrl(options: GetUrlOptions): Promise<string>;
  
  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;
  
  /**
   * Get file metadata
   */
  getMetadata(path: string): Promise<Partial<UploadResult> | null>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
