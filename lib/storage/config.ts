/**
 * Storage Configuration
 * 
 * Configure storage providers and default settings
 */

/**
 * Parse file size from environment variable
 * Supports formats like: 10MB, 5M, 100KB, 1GB
 */
function parseFileSize(sizeStr: string | undefined, defaultSize: number): number {
  if (!sizeStr) return defaultSize;
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB|K|M|G)?$/i);
  if (!match) return defaultSize;
  
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'MB').toUpperCase();
  
  const multipliers: Record<string, number> = {
    'KB': 1024,
    'K': 1024,
    'MB': 1024 * 1024,
    'M': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'G': 1024 * 1024 * 1024,
  };
  
  return Math.floor(value * (multipliers[unit] || 1));
}

export const storageConfig = {
  /**
   * Default storage provider
   * Options: 'local', 's3', 'cloudinary', 'r2'
   */
  provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3' | 'cloudinary' | 'r2',
  
  /**
   * File size limits (configurable via environment variables)
   */
  limits: {
    // Maximum size for image files (default: 5MB)
    maxImageSize: parseFileSize(process.env.MAX_IMAGE_SIZE, 5 * 1024 * 1024),
    
    // Maximum size for non-image files (default: 10MB)
    maxFileSize: parseFileSize(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024),
  },
  
  /**
   * Default upload options
   */
  defaults: {
    maxSize: parseFileSize(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024),
    allowedTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Text
      'text/plain',
      'text/csv',
    ],
    public: true,
    folder: 'uploads',
  },
  
  /**
   * Local storage configuration
   */
  local: {
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  /**
   * AWS S3 configuration
   */
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT, // Optional: for S3-compatible services
  },
  
  /**
   * Cloudinary configuration
   */
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'uploads',
  },

  /**
   * Cloudflare R2 configuration
   */
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    bucketName: process.env.R2_BUCKET_NAME || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    publicDomain: process.env.R2_PUBLIC_DOMAIN,
    jurisdiction: process.env.R2_JURISDICTION || 'auto',
  },
} as const;

/**
 * Preset configurations for common file types
 * Uses environment-configured limits where applicable
 */
export const storagePresets = {
  image: {
    maxSize: storageConfig.limits.maxImageSize,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folder: 'images',
  },
  avatar: {
    maxSize: Math.min(storageConfig.limits.maxImageSize, 2 * 1024 * 1024), // 2MB or configured limit, whichever is smaller
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'avatars',
  },
  document: {
    maxSize: Math.max(storageConfig.limits.maxFileSize, 20 * 1024 * 1024), // 20MB or configured limit, whichever is larger
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    folder: 'documents',
  },
  video: {
    maxSize: Math.max(storageConfig.limits.maxFileSize, 100 * 1024 * 1024), // 100MB or configured limit, whichever is larger
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    folder: 'videos',
  },
} as const;
