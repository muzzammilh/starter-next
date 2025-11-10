'use client';

/**
 * Image Upload Component
 * 
 * Specialized component for image uploads with preview
 * 
 * @example
 * ```tsx
 * <ImageUpload
 *   currentImage="/avatar.jpg"
 *   onUploadComplete={(url) => updateAvatar(url)}
 *   preset="avatar"
 * />
 * ```
 */

import { useState } from 'react';
import { FileUpload } from './FileUpload';

interface ImageUploadProps {
  /**
   * Current image URL
   */
  currentImage?: string | null;
  
  /**
   * Callback when upload completes
   */
  onUploadComplete?: (url: string) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
  
  /**
   * Storage preset
   */
  preset?: 'image' | 'avatar';
  
  /**
   * Custom folder
   */
  folder?: string;
  
  /**
   * Shape of the preview
   */
  shape?: 'square' | 'circle';
  
  /**
   * Size of the preview
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Custom class name
   */
  className?: string;
}

export function ImageUpload({
  currentImage,
  onUploadComplete,
  onUploadError,
  preset = 'image',
  folder,
  shape = 'square',
  size = 'md',
  className = '',
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImage || null);
  
  const handleUploadComplete = (result: any) => {
    setImageUrl(result.url);
    onUploadComplete?.(result.url);
  };
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };
  
  const shapeClasses = {
    square: 'rounded-lg',
    circle: 'rounded-full',
  };
  
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {imageUrl && (
        <div className={`${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden border-2 border-zinc-200 dark:border-zinc-700`}>
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <FileUpload
        onUploadComplete={handleUploadComplete}
        onUploadError={onUploadError}
        preset={preset}
        folder={folder}
        accept="image/*"
        className="w-full"
      />
    </div>
  );
}
