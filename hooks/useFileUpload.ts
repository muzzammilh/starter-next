/**
 * File Upload Hook
 * 
 * React hook for handling file uploads with state management
 * 
 * @example
 * ```tsx
 * const { upload, isUploading, progress, error } = useFileUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   const result = await upload(file, { preset: 'avatar' });
 *   console.log(result.url);
 * };
 * ```
 */

import { useState, useCallback } from 'react';

interface UploadOptions {
  preset?: 'image' | 'avatar' | 'document' | 'video';
  folder?: string;
  public?: boolean;
}

interface UploadResult {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  path: string;
  provider: string;
  uploadedAt: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const upload = useCallback(async (
    file: File,
    options?: UploadOptions
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.preset) formData.append('preset', options.preset);
      if (options?.folder) formData.append('folder', options.folder);
      if (options?.public === false) formData.append('public', 'false');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      // Reset after success
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      return null;
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);
  
  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
