/**
 * File Management API Routes
 * 
 * GET: Get file details
 * DELETE: Delete file from storage and database
 */

import { NextRequest } from 'next/server';
import { storage, StorageError } from '@/lib/storage';
import { getFileById, deleteFileFromDatabase } from '@/lib/storage/db';
import { requireAuth, getAuthUser } from '@/lib/api/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get file details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
    const requestLogger = logger.child({
      endpoint: '/api/files/[id]',
      method: 'GET',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const user = await getAuthUser(request);
      const { id } = await params;
      
      requestLogger.debug({ userId: user!.id, fileId: id }, 'Getting file details');
      
      // Get file from database
      const file = await getFileById(id);
      
      if (!file) {
        requestLogger.warn({ userId: user!.id, fileId: id }, 'File not found');
        return apiError('File not found', 404, 'FILE_NOT_FOUND');
      }
      
      // Check ownership
      if (file.userId !== user!.id) {
        requestLogger.warn(
          { userId: user!.id, fileId: id, ownerId: file.userId },
          'Unauthorized file access attempt'
        );
        return apiError('Unauthorized', 403, 'UNAUTHORIZED');
      }
      
      requestLogger.info({ userId: user!.id, fileId: id }, 'File retrieved successfully');
      
      return apiSuccess(file, 'File retrieved successfully');
    } catch (error) {
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to get file'
      );
      return apiError('Failed to get file', 500, 'GET_FILE_ERROR');
    }
}

/**
 * Delete file from storage and database
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
    const requestLogger = logger.child({
      endpoint: '/api/files/[id]',
      method: 'DELETE',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const user = await getAuthUser(request);
      const { id } = await params;
      
      requestLogger.debug({ userId: user!.id, fileId: id }, 'Delete attempt');
      
      // Get file from database
      const file = await getFileById(id);
      
      if (!file) {
        requestLogger.warn({ userId: user!.id, fileId: id }, 'File not found');
        return apiError('File not found', 404, 'FILE_NOT_FOUND');
      }
      
      // Check ownership
      if (file.userId !== user!.id) {
        requestLogger.warn(
          { userId: user!.id, fileId: id, ownerId: file.userId },
          'Unauthorized delete attempt'
        );
        return apiError('Unauthorized', 403, 'UNAUTHORIZED');
      }
      
      // Delete from storage
      try {
        await storage.delete({ path: file.path });
        requestLogger.debug({ path: file.path }, 'File deleted from storage');
      } catch (error) {
        requestLogger.warn(
          {
            error: error instanceof Error ? error.message : String(error),
            path: file.path,
          },
          'Failed to delete file from storage, continuing with database deletion'
        );
      }
      
      // Delete from database
      await deleteFileFromDatabase(id);
      
      requestLogger.info(
        { fileId: id, userId: user!.id, filename: file.filename },
        'File deleted successfully'
      );
      
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
