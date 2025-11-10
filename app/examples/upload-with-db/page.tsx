/**
 * File Upload with Database Integration Example
 * 
 * Demonstrates uploading files and tracking them in the database
 */

'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import Link from 'next/link';

interface FileRecord {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  provider: string;
  createdAt: string;
}

export default function UploadWithDbPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { upload, isUploading } = useFileUpload();
  
  // Load user's files
  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const result = await response.json();
        setFiles(result.data);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load storage info
  const loadStorageInfo = async () => {
    try {
      const response = await fetch('/api/files/storage-info');
      if (response.ok) {
        const result = await response.json();
        setStorageInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };
  
  useEffect(() => {
    loadFiles();
    loadStorageInfo();
  }, []);
  
  const handleUploadComplete = async (result: any) => {
    // Reload files and storage info
    await loadFiles();
    await loadStorageInfo();
  };
  
  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Reload files and storage info
        await loadFiles();
        await loadStorageInfo();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/examples"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Examples
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          File Upload with Database
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Upload files and track them in the database
        </p>
        
        {/* Storage Info */}
        {storageInfo && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Storage Usage
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Size</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {storageInfo.totalSizeFormatted}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Files</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {storageInfo.fileCount}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Section */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Upload File
          </h2>
          
          <FileUpload
            onUploadComplete={handleUploadComplete}
            preset="image"
          />
        </section>
        
        {/* Files List */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Your Files ({files.length})
          </h2>
          
          {isLoading ? (
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No files uploaded yet. Upload your first file above!
            </p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  {file.mimeType.startsWith('image/') && (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(file.size / 1024).toFixed(2)} KB • {file.provider} •{' '}
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Database Integration
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Files are tracked in the database with metadata. When you delete a file,
            it's removed from both storage and the database. This example demonstrates
            a complete file management system.
          </p>
        </div>
      </div>
    </div>
  );
}
