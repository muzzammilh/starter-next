/**
 * Storage Info API Route
 * 
 * GET: Get user's storage usage information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserStorageUsage } from '@/lib/storage/db';
import { withApiMiddleware } from '@/lib/api/utils';
import { requireAuth, getAuthUser } from '@/lib/api/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { formatBytes } from '@/lib/storage/utils';
import { logger } from '@/lib/logger';

export const GET = withApiMiddleware(
  async (request: NextRequest) => {
    const requestLogger = logger.child({
      endpoint: '/api/files/storage-info',
      method: 'GET',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const user = await getAuthUser(request);
      
      requestLogger.debug({ userId: user!.id }, 'Getting storage info');
      
      // Get storage usage
      const usage = await getUserStorageUsage(user!.id);
      
      requestLogger.info(
        {
          userId: user!.id,
          totalSize: usage.totalSize,
          fileCount: usage.fileCount,
        },
        'Storage info retrieved successfully'
      );
      
      return apiSuccess(
        {
          totalSize: usage.totalSize,
          totalSizeFormatted: formatBytes(usage.totalSize),
          fileCount: usage.fileCount,
        },
        'Storage info retrieved successfully'
      );
    } catch (error) {
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to get storage info'
      );
      return apiError('Failed to get storage info', 500, 'STORAGE_INFO_ERROR');
    }
  },
  {
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  }
);
