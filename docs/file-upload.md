# File Upload System

A flexible, provider-agnostic file upload system that works seamlessly with local storage, AWS S3, and Cloudinary.

## Features

- 🔄 **Provider-Agnostic** - Switch between storage providers without changing code
- 📁 **Local Storage** - Default option, perfect for development
- ☁️ **Cloud Storage** - S3 and Cloudinary support for production
- ✅ **Validation** - File size and type validation
- 🎨 **UI Components** - Ready-to-use React components
- 🔒 **Secure** - Authentication required, rate limiting enabled
- 📝 **Type-Safe** - Full TypeScript support
- 🎯 **Presets** - Pre-configured settings for common use cases

## Quick Start

### 1. Try the Example

Visit the example page to see it in action:

```bash
npm run dev
# Open http://localhost:3000/examples/upload
```

### 2. Basic Usage

```typescript
import { storage } from '@/lib/storage';

// Upload a file
const result = await storage.upload(file);
console.log(result.url); // Public URL to the file

// Delete a file
await storage.delete({ path: result.path });
```

### 3. Use the React Component

```tsx
import { FileUpload } from '@/components/upload/FileUpload';

export default function MyPage() {
  return (
    <FileUpload
      onUploadComplete={(result) => {
        console.log('Uploaded:', result.url);
      }}
      preset="image"
    />
  );
}
```

## Storage Providers

### Local Storage (Default)

Files are stored in `public/uploads` directory.

**Pros:**
- Zero configuration
- Perfect for development
- No external dependencies

**Cons:**
- Not suitable for serverless (Vercel, AWS Lambda)
- Files lost on container restart
- No CDN

**Configuration:**
```env
STORAGE_PROVIDER=local
UPLOAD_DIR=./public/uploads

# Optional: Configure file size limits
MAX_IMAGE_SIZE=5MB    # Default: 5MB for images
MAX_FILE_SIZE=10MB    # Default: 10MB for other files
```

### AWS S3

Store files in Amazon S3 or S3-compatible services.

**Pros:**
- Highly scalable
- Works in serverless
- CDN integration
- Versioning support

**Setup:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Configuration:**
```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: For S3-compatible services (DigitalOcean Spaces, MinIO, etc.)
# AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

### Cloudinary

Store files in Cloudinary with automatic image optimization.

**Pros:**
- Automatic image optimization
- Built-in transformations
- Video support
- Great for media-heavy apps

**Setup:**
```bash
npm install cloudinary
```

**Configuration:**
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=uploads
```

## API Usage

### Upload a File

```typescript
import { storage } from '@/lib/storage';

// Basic upload
const result = await storage.upload(file);

// With options
const result = await storage.upload(file, {
  folder: 'avatars',
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png'],
  public: true,
  metadata: { userId: '123' },
});

console.log(result);
// {
//   id: 'unique-id',
//   filename: 'original-name.jpg',
//   size: 123456,
//   mimeType: 'image/jpeg',
//   url: 'https://...',
//   path: 'avatars/unique-id.jpg',
//   provider: 's3',
//   uploadedAt: Date,
//   metadata: { userId: '123' }
// }
```

### Delete a File

```typescript
await storage.delete({ path: 'avatars/unique-id.jpg' });
```

### Get File URL

```typescript
// Public URL
const url = await storage.getUrl({ path: 'avatars/unique-id.jpg' });

// Signed URL (private files, expires in 1 hour)
const url = await storage.getUrl({
  path: 'private/document.pdf',
  expiresIn: 3600,
});
```

### Check if File Exists

```typescript
const exists = await storage.exists('avatars/unique-id.jpg');
```

### Get File Metadata

```typescript
const metadata = await storage.getMetadata('avatars/unique-id.jpg');
console.log(metadata?.size, metadata?.uploadedAt);
```

## Presets

Pre-configured settings for common use cases. Presets automatically use environment-configured size limits:

```typescript
import { storage, storagePresets } from '@/lib/storage';

// Avatar upload (2MB or MAX_IMAGE_SIZE, whichever is smaller)
await storage.upload(file, storagePresets.avatar);

// Image upload (uses MAX_IMAGE_SIZE, default: 5MB)
await storage.upload(file, storagePresets.image);

// Document upload (20MB or MAX_FILE_SIZE, whichever is larger)
await storage.upload(file, storagePresets.document);

// Video upload (100MB or MAX_FILE_SIZE, whichever is larger)
await storage.upload(file, storagePresets.video);
```

**Preset Details:**

| Preset | Size Limit | Allowed Types | Folder |
|--------|-----------|---------------|--------|
| `avatar` | 2MB or `MAX_IMAGE_SIZE` (smaller) | JPEG, PNG, WebP | `avatars` |
| `image` | `MAX_IMAGE_SIZE` (default: 5MB) | JPEG, PNG, GIF, WebP | `images` |
| `document` | 20MB or `MAX_FILE_SIZE` (larger) | PDF, Word, Excel | `documents` |
| `video` | 100MB or `MAX_FILE_SIZE` (larger) | MP4, WebM, QuickTime | `videos` |

## React Components

### FileUpload

General-purpose file upload component with drag-and-drop.

```tsx
import { FileUpload } from '@/components/upload/FileUpload';

<FileUpload
  onUploadComplete={(result) => console.log(result.url)}
  onUploadError={(error) => console.error(error)}
  preset="image"
  folder="gallery"
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  className="my-4"
/>
```

**Props:**
- `onUploadComplete` - Callback when upload succeeds
- `onUploadError` - Callback when upload fails
- `preset` - Use a preset configuration
- `folder` - Custom folder for uploads
- `isPublic` - Whether file should be public (default: true)
- `accept` - File input accept attribute
- `maxSize` - Maximum file size in bytes
- `className` - Custom CSS class

### ImageUpload

Specialized component for image uploads with preview.

```tsx
import { ImageUpload } from '@/components/upload/ImageUpload';

<ImageUpload
  currentImage="/avatar.jpg"
  onUploadComplete={(url) => updateAvatar(url)}
  preset="avatar"
  shape="circle"
  size="lg"
/>
```

**Props:**
- `currentImage` - Current image URL to display
- `onUploadComplete` - Callback with uploaded URL
- `onUploadError` - Callback when upload fails
- `preset` - 'image' or 'avatar'
- `folder` - Custom folder
- `shape` - 'square' or 'circle'
- `size` - 'sm', 'md', or 'lg'
- `className` - Custom CSS class

## API Routes

### POST /api/upload

Upload a file.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'avatars'); // Optional
formData.append('preset', 'avatar'); // Optional
formData.append('public', 'true'); // Optional

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "unique-id",
    "filename": "avatar.jpg",
    "size": 123456,
    "mimeType": "image/jpeg",
    "url": "https://...",
    "path": "avatars/unique-id.jpg",
    "provider": "s3",
    "uploadedAt": "2024-11-10T12:00:00.000Z"
  },
  "message": "File uploaded successfully",
  "meta": {
    "timestamp": "2024-11-10T12:00:00.000Z"
  }
}
```

### GET /api/upload/[id]

Get file metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "avatars/unique-id.jpg",
    "size": 123456,
    "mimeType": "image/jpeg",
    "url": "https://...",
    "provider": "s3",
    "uploadedAt": "2024-11-10T12:00:00.000Z"
  }
}
```

### DELETE /api/upload/[id]

Delete a file (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "File deleted successfully"
}
```

## Validation

Files are validated before upload based on type and size:

### Automatic Size Limits

The system automatically applies appropriate size limits:

```typescript
// Images use MAX_IMAGE_SIZE (default: 5MB)
const imageFile = new File([...], 'photo.jpg', { type: 'image/jpeg' });
await storage.upload(imageFile); // Uses 5MB limit

// Other files use MAX_FILE_SIZE (default: 10MB)
const pdfFile = new File([...], 'document.pdf', { type: 'application/pdf' });
await storage.upload(pdfFile); // Uses 10MB limit
```

### Custom Size Limits

Override the automatic limits:

```typescript
// Custom size for specific upload
await storage.upload(file, {
  maxSize: 20 * 1024 * 1024, // 20MB
});
```

### Type Validation

```typescript
// Type validation
allowedTypes: [
  'image/jpeg',
  'image/png',
  'application/pdf',
]
```

**Error Response:**
```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 5 MB",
  "code": "VALIDATION_ERROR"
}
```

## Database Integration

Store file metadata in your database:

```typescript
// prisma/schema.prisma
model File {
  id        String   @id @default(cuid())
  userId    String
  filename  String
  size      Int
  mimeType  String
  url       String
  path      String
  provider  String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("files")
}
```

```typescript
// Save to database after upload
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';

const result = await storage.upload(file);

await prisma.file.create({
  data: {
    userId: user.id,
    filename: result.filename,
    size: result.size,
    mimeType: result.mimeType,
    url: result.url,
    path: result.path,
    provider: result.provider,
  },
});
```

## Advanced Usage

### Custom Storage Provider

Create your own storage provider:

```typescript
// lib/storage/providers/custom.ts
import { StorageProvider, UploadOptions, UploadResult } from '../types';

export class CustomStorageProvider implements StorageProvider {
  name = 'custom';
  
  async upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Your upload logic
  }
  
  async delete(options: DeleteOptions): Promise<void> {
    // Your delete logic
  }
  
  async getUrl(options: GetUrlOptions): Promise<string> {
    // Your URL logic
  }
  
  async exists(path: string): Promise<boolean> {
    // Your exists logic
  }
  
  async getMetadata(path: string): Promise<Partial<UploadResult> | null> {
    // Your metadata logic
  }
}
```

### Image Transformations (Cloudinary)

```typescript
// Get transformed image URL
const url = await storage.getUrl({
  path: 'avatars/user.jpg',
  // Cloudinary-specific transformations
  transformation: {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
  },
});
```

### Direct Upload to S3 (Client-Side)

For large files, use presigned URLs:

```typescript
// Server: Generate presigned URL
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const command = new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: 'path/to/file.jpg',
});

const presignedUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600,
});

// Client: Upload directly to S3
await fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
});
```

## Best Practices

### 1. Use Appropriate Presets

```typescript
// ✅ Good - Use presets for common scenarios
await storage.upload(file, storagePresets.avatar);

// ❌ Bad - Reinventing the wheel
await storage.upload(file, {
  maxSize: 2 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png'],
  folder: 'avatars',
});
```

### 2. Store Metadata in Database

```typescript
// ✅ Good - Keep track of uploads
const result = await storage.upload(file);
await prisma.file.create({ data: { ...result, userId } });

// ❌ Bad - No record of uploads
await storage.upload(file);
```

### 3. Clean Up Old Files

```typescript
// Delete file from storage when deleting from database
await storage.delete({ path: file.path });
await prisma.file.delete({ where: { id: file.id } });
```

### 4. Use Signed URLs for Private Files

```typescript
// ✅ Good - Temporary access to private files
const url = await storage.getUrl({
  path: 'private/document.pdf',
  expiresIn: 3600, // 1 hour
});

// ❌ Bad - Public access to sensitive files
await storage.upload(file, { public: true });
```

### 5. Validate on Both Client and Server

```typescript
// Client-side validation (better UX)
if (file.size > 5 * 1024 * 1024) {
  alert('File too large');
  return;
}

// Server-side validation (security)
await storage.upload(file, {
  maxSize: 5 * 1024 * 1024,
});
```

## Troubleshooting

### Files Not Uploading

**Check authentication:**
```typescript
// Make sure user is authenticated
const authError = await requireAuth(request);
if (authError) return authError;
```

**Check file size:**
```typescript
// Increase max size if needed
await storage.upload(file, {
  maxSize: 20 * 1024 * 1024, // 20MB
});
```

**Check MIME type:**
```typescript
// Add allowed types
await storage.upload(file, {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
});
```

### Local Storage Not Working

**Ensure directory exists:**
```bash
mkdir -p public/uploads
```

**Check permissions:**
```bash
chmod 755 public/uploads
```

### S3 Upload Failing

**Verify credentials:**
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket
```

**Check bucket policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

**Check CORS configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

### Cloudinary Upload Failing

**Verify credentials:**
```bash
# Check Cloudinary dashboard
# Settings > Account > API Keys
```

**Check upload preset:**
```env
# Make sure folder exists in Cloudinary
CLOUDINARY_FOLDER=uploads
```

## Production Checklist

- [ ] Choose appropriate storage provider (S3/Cloudinary for serverless)
- [ ] Set up environment variables
- [ ] Configure CORS for cloud storage
- [ ] Set appropriate file size limits
- [ ] Implement file cleanup strategy
- [ ] Store file metadata in database
- [ ] Add virus scanning (optional)
- [ ] Set up CDN (if using S3)
- [ ] Monitor storage usage
- [ ] Implement backup strategy

## Examples

See working examples at:
- `/examples/upload` - Interactive upload examples
- `/app/api/upload` - API route implementation
- `/components/upload` - React components

## Learn More

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body)
