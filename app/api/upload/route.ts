/**
 * File Upload API Route
 * 
 * Handles file uploads with validation and storage
 * 
 * @example Upload a file
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 * formData.append('folder', 'avatars');
 * 
 * const response = await fetch('/api/upload', {
 *   method: 'POST',
 *   body: formData,
 * });
 * 
 * const result = await response.json();
 * console.log(result.data.url);
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { storage, StorageError, storagePresets } from '@/lib/storage';
import { withApiMiddleware } from '@/lib/api/utils';
import { requireAuth } from '@/lib/api/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

export const POST = withApiMiddleware(
  async (request: NextRequest) => {
    const requestLogger = logger.child({
      endpoint: '/api/upload',
      method: 'POST',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      // Parse form data
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        requestLogger.warn('No file provided');
        return apiError('No file provided', 400, 'NO_FILE');
      }
      
      // Get optional parameters
      const folder = formData.get('folder') as string | null;
      const preset = formData.get('preset') as keyof typeof storagePresets | null;
      const isPublic = formData.get('public') !== 'false';
      
      requestLogger.debug(
        {
          filename: file.name,
          size: file.size,
          type: file.type,
          folder,
          preset,
        },
        'Upload attempt'
      );
      
      // Build upload options
      const options = preset
        ? { ...storagePresets[preset], allowedTypes: [...storagePresets[preset].allowedTypes], public: isPublic }
        : { folder: folder || undefined, public: isPublic };
      
      // Upload file
      const result = await storage.upload(file, options);
      
      requestLogger.info(
        {
          filename: result.filename,
          size: result.size,
          provider: result.provider,
        },
        'File uploaded successfully'
      );
      
      return apiSuccess(result, 'File uploaded successfully');
    } catch (error) {
      if (error instanceof StorageError) {
        requestLogger.warn(
          { error: error.message, code: error.code },
          'Storage error during upload'
        );
        return apiError(error.message, error.statusCode, error.code);
      }
      
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to upload file'
      );
      return apiError('Failed to upload file', 500, 'UPLOAD_ERROR');
    }
  },
  {
    rateLimit: { maxRequests: 20, windowMs: 60000 }, // 20 uploads per minute
  }
);
