/**
 * Database Integration for File Storage
 * 
 * Helper functions to track uploaded files in the database
 */

import { prisma } from '@/lib/db';
import { UploadResult } from './types';

/**
 * Save file metadata to database
 */
export async function saveFileToDatabase(
  userId: string,
  uploadResult: UploadResult,
  folder?: string
) {
  return await prisma.file.create({
    data: {
      userId,
      filename: uploadResult.filename,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      url: uploadResult.url,
      path: uploadResult.path,
      provider: uploadResult.provider,
      folder,
      metadata: uploadResult.metadata ? JSON.stringify(uploadResult.metadata) : null,
    },
  });
}

/**
 * Get user's files
 */
export async function getUserFiles(userId: string, options?: {
  folder?: string;
  limit?: number;
  offset?: number;
}) {
  return await prisma.file.findMany({
    where: {
      userId,
      ...(options?.folder && { folder: options.folder }),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Get file by ID
 */
export async function getFileById(fileId: string) {
  return await prisma.file.findUnique({
    where: { id: fileId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}

/**
 * Delete file from database
 */
export async function deleteFileFromDatabase(fileId: string) {
  return await prisma.file.delete({
    where: { id: fileId },
  });
}

/**
 * Get user's total storage usage
 */
export async function getUserStorageUsage(userId: string) {
  const result = await prisma.file.aggregate({
    where: { userId },
    _sum: { size: true },
    _count: true,
  });
  
  return {
    totalSize: result._sum.size || 0,
    fileCount: result._count,
  };
}

/**
 * Clean up orphaned files (files in storage but not in database)
 * This should be run periodically as a background job
 */
export async function cleanupOrphanedFiles() {
  // TODO: Implement cleanup logic
  // 1. List all files in storage
  // 2. Compare with database records
  // 3. Delete files not in database
}
