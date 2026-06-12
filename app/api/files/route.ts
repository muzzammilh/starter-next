/**
 * Files API Route
 * 
 * GET: List user's files
 * POST: Upload file and save to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { storage, StorageError, storagePresets } from '@/lib/storage';
import { saveFileToDatabase, getUserFiles } from '@/lib/storage/db';
import { withApiMiddleware } from '@/lib/api/utils';
import { requireAuth, getAuthUser } from '@/lib/api/middleware';
import { apiSuccess, apiError, apiPaginated } from '@/lib/api/response';
import { logger } from '@/lib/logger';

/**
 * List user's files
 */
export const GET = withApiMiddleware(
  async (request: NextRequest) => {
    const requestLogger = logger.child({
      endpoint: '/api/files',
      method: 'GET',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const user = await getAuthUser(request);
      const { searchParams } = request.nextUrl;
      
      const folder = searchParams.get('folder') || undefined;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      
      requestLogger.debug({ userId: user!.id, folder, page, limit }, 'Listing user files');
      
      // Get files from database
      const files = await getUserFiles(user!.id, {
        folder,
        limit,
        offset: (page - 1) * limit,
      });
      
      // Get total count
      const prisma = (await import('@/lib/db')).prisma;
      const total = await prisma.file.count({
        where: {
          userId: user!.id,
          ...(folder && { folder }),
        },
      });
      
      requestLogger.info({ userId: user!.id, count: files.length, total }, 'Files listed successfully');
      
      return apiPaginated(files, page, limit, total);
    } catch (error) {
      requestLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Failed to list files'
      );
      return apiError('Failed to list files', 500, 'LIST_FILES_ERROR');
    }
  },
  {
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  }
);

/**
 * Upload file and save to database
 */
export const POST = withApiMiddleware(
  async (request: NextRequest) => {
    const requestLogger = logger.child({
      endpoint: '/api/files',
      method: 'POST',
      requestId: crypto.randomUUID(),
    });

    try {
      // Require authentication
      const authError = await requireAuth(request);
      if (authError) return authError;
      
      const user = await getAuthUser(request);
      
      // Parse form data
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        requestLogger.warn({ userId: user!.id }, 'No file provided');
        return apiError('No file provided', 400, 'NO_FILE');
      }
      
      // Get optional parameters
      const folder = formData.get('folder') as string | null;
      const preset = formData.get('preset') as keyof typeof storagePresets | null;
      const isPublic = formData.get('public') !== 'false';
      
      requestLogger.debug(
        {
          userId: user!.id,
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
      
      // Save to database
      const dbFile = await saveFileToDatabase(user!.id, result, folder || undefined);
      
      requestLogger.info(
        {
          fileId: dbFile.id,
          filename: result.filename,
          size: result.size,
          provider: result.provider,
          userId: user!.id,
        },
        'File uploaded and saved to database'
      );
      
      return apiSuccess(
        {
          ...result,
          id: dbFile.id, // Use database ID
        },
        'File uploaded successfully'
      );
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
    rateLimit: { maxRequests: 20, windowMs: 60000 },
  }
);
