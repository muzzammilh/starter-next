/**
 * File Upload Example Page
 * 
 * Demonstrates various file upload scenarios
 */

'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { ImageUpload } from '@/components/upload/ImageUpload';
import Link from 'next/link';

export default function UploadExamplePage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const handleUploadComplete = (result: any) => {
    setUploadedFiles((prev) => [result, ...prev]);
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
          File Upload Examples
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Demonstrating various file upload scenarios with different presets and options
        </p>
        
        {/* Avatar Upload */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Avatar Upload
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Upload a profile picture (max 2MB, images only)
          </p>
          
          <ImageUpload
            currentImage={avatarUrl}
            onUploadComplete={setAvatarUrl}
            preset="avatar"
            shape="circle"
            size="lg"
          />
          
          {avatarUrl && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Avatar uploaded successfully!
              </p>
              <code className="text-xs text-green-700 dark:text-green-300 break-all">
                {avatarUrl}
              </code>
            </div>
          )}
        </section>
        
        {/* General Image Upload */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Image Upload
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Upload any image (max 5MB)
          </p>
          
          <FileUpload
            onUploadComplete={handleUploadComplete}
            preset="image"
            accept="image/*"
          />
        </section>
        
        {/* Document Upload */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Document Upload
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Upload documents (PDF, Word, Excel - max 20MB)
          </p>
          
          <FileUpload
            onUploadComplete={handleUploadComplete}
            preset="document"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
        </section>
        
        {/* Custom Upload */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Custom Upload
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Upload to custom folder with custom settings
          </p>
          
          <FileUpload
            onUploadComplete={handleUploadComplete}
            folder="custom-folder"
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </section>
        
        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <section className="bg-white dark:bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700"
                >
                  {file.mimeType.startsWith('image/') && (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(file.size / 1024).toFixed(2)} KB • {file.provider}
                    </p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View file
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Storage Provider
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Currently using <strong>local</strong> storage. Files are stored in{' '}
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
              public/uploads
            </code>
            . To use S3 or Cloudinary, set the <code>STORAGE_PROVIDER</code>{' '}
            environment variable.
          </p>
        </div>
      </div>
    </div>
  );
}
