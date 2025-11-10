/**
 * Type declarations for optional storage provider dependencies
 * These packages are optional and only needed if you use the respective storage provider
 */

declare module 'cloudinary' {
  export const v2: any;
}

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: any);
    send(command: any): Promise<any>;
  }
  export class PutObjectCommand {
    constructor(input: any);
  }
  export class DeleteObjectCommand {
    constructor(input: any);
  }
  export class GetObjectCommand {
    constructor(input: any);
  }
  export class HeadObjectCommand {
    constructor(input: any);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options?: any): Promise<string>;
}
