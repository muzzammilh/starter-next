/**
 * File Management API Routes
 * 
 * GET: Get file metadata
 * DELETE: Delete a file
 */

import { NextRequest } from 'next/server';
import { storage, StorageError } from '@/lib/storage';
import { requireAuth } from '@/lib/api/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get file metadata
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
    const requestLogger = logger.child({
      endpoint: '/api/upload/[id]',
      method: 'GET',
      requestId: crypto.randomUUID(),
    });

    try {
      const { id } = await params;
      
      requestLogger.debug({ fileId: id }, 'Getting file metadata');
      
      // Get file metadata
      const metadata = await storage.getMetadata(id);
      
      if (!metadata) {
        requestLogger.warn({ fileId: id }, 'File not found');
        return apiError('File not found', 404, 'FILE_NOT_FOUND');
      }
      
      requestLogger.info({ fileId: id }, 'File metadata retrieved successfully');
      
      return apiSuccess(metadata, 'File metadata retrieved successfully');
    } catch (error) {
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to get file metadata'
      );
      return apiError('Failed to get file metadata', 500, 'GET_METADATA_ERROR');
    }
}

/**
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
    const requestLogger = logger.child({
      endpoint: '/api/upload/[id]',
      method: 'DELETE',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const { id } = await params;
      
      requestLogger.debug({ fileId: id }, 'Delete attempt');
      
      // Check if file exists
      const exists = await storage.exists(id);
      if (!exists) {
        requestLogger.warn({ fileId: id }, 'File not found');
        return apiError('File not found', 404, 'FILE_NOT_FOUND');
      }
      
      // Delete file
      await storage.delete({ path: id });
      
      requestLogger.info({ fileId: id }, 'File deleted successfully');
      
      return apiSuccess(null, 'File deleted successfully');
    } catch (error) {
      if (error instanceof StorageError) {
        requestLogger.warn(
          { error: error.message, code: error.code },
          'Storage error during delete'
        );
        return apiError(error.message, error.statusCode, error.code);
      }
      
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to delete file'
      );
      return apiError('Failed to delete file', 500, 'DELETE_ERROR');
    }
}
