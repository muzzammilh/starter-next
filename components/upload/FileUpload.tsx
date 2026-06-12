'use client';

/**
 * File Upload Component
 * 
 * Reusable file upload component with drag-and-drop support
 * 
 * @example
 * ```tsx
 * <FileUpload
 *   onUploadComplete={(result) => console.log(result.url)}
 *   preset="avatar"
 * />
 * ```
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { formatBytes } from '@/lib/storage/utils';

interface FileUploadProps {
  /**
   * Callback when upload completes successfully
   */
  onUploadComplete?: (result: any) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
  
  /**
   * Storage preset to use
   */
  preset?: 'image' | 'avatar' | 'document' | 'video';
  
  /**
   * Custom folder for uploads
   */
  folder?: string;
  
  /**
   * Whether file should be public
   */
  isPublic?: boolean;
  
  /**
   * Accept attribute for file input
   */
  accept?: string;
  
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  
  /**
   * Custom class name
   */
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  preset,
  folder,
  isPublic = true,
  accept,
  maxSize,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFile = async (file: File) => {
    setError(null);
    setPreview(null);
    
    // Validate file size
    if (maxSize && file.size > maxSize) {
      const errorMsg = `File size exceeds maximum of ${formatBytes(maxSize)}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }
    
    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    // Upload file
    await uploadFile(file);
  };
  
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (preset) formData.append('preset', preset);
      if (folder) formData.append('folder', folder);
      if (!isPublic) formData.append('public', 'false');
      
      // Simulate progress (real progress requires XHR)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      onUploadComplete?.(result.data);
      
      // Reset after success
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      setIsUploading(false);
      setUploadProgress(0);
      onUploadError?.(errorMsg);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
          disabled={isUploading}
        />
        
        {preview ? (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded"
            />
          </div>
        ) : (
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        
        {isUploading ? (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Uploading... {uploadProgress}%
            </p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            {maxSize && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                Maximum file size: {formatBytes(maxSize)}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
