# API Middleware

Production-ready middleware for Next.js API routes with rate limiting, CORS, validation, error handling, and logging.

## Features

- 🛡️ **Rate Limiting** - Prevent API abuse with configurable limits
- 🌐 **CORS** - Secure cross-origin requests
- ✅ **Request Validation** - Type-safe validation with Zod
- 🔐 **Authentication** - Reusable auth checks
- 🚨 **Error Handling** - Consistent error responses
- 📝 **Request Logging** - Automatic API logging with timing
- 🎯 **Easy to Use** - Simple wrapper or individual middleware

## Quick Start (3 Steps)

### Step 1: Try the Examples

Start your dev server and test the example routes:

```bash
npm run dev
```

Visit these URLs:
- http://localhost:3000/api/examples/rate-limited
- http://localhost:3000/api/examples/protected
- http://localhost:3000/api/examples/validated
- http://localhost:3000/api/examples/with-cors
- http://localhost:3000/api/examples/complete

### Step 2: Create Your First Protected API

Create `app/api/posts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware } from '@/lib/api';
import { requireAuth, validateRequest } from '@/lib/api/middleware';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export const POST = withApiMiddleware(
  async (request: NextRequest) {
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    const validation = await validateRequest(request, { body: createPostSchema });
    if (!validation.success) return validation.error;
    
    const { title, content } = validation.data!.body!;
    
    // Your business logic here
    return NextResponse.json({ message: 'Post created', data: { title, content } }, { status: 201 });
  },
  {
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    cors: { allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!] },
    logging: true,
  }
);
```

### Step 3: Test Your API

```bash
# Valid request
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"This is my content"}'

# Test validation (should fail)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hi","content":"Short"}'
```

## Usage Patterns

### Pattern 1: Use the Wrapper (Recommended)

The easiest way to add middleware:

```typescript
import { withApiMiddleware } from '@/lib/api/utils';

export const GET = withApiMiddleware(
  async (request) => {
    return NextResponse.json({ message: 'Hello' });
  },
  {
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    cors: { allowedOrigins: ['https://example.com'] },
    logging: true,
  }
);
```

### Pattern 2: Use Individual Middleware

For more control:

```typescript
import { rateLimit, requireAuth, validateRequest } from '@/lib/api/middleware';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (rateLimitResult) return rateLimitResult;
  
  // Authentication
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  // Validation
  const validation = await validateRequest(request, { body: schema });
  if (!validation.success) return validation.error;
  
  // Your logic here
  return NextResponse.json({ success: true });
}
```

## Rate Limiting

Prevent API abuse by limiting requests per IP address.

### Basic Usage

```typescript
import { rateLimit } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request);
  if (rateLimitResult) return rateLimitResult;
  
  // Your logic here
}
```

### Configuration

```typescript
const rateLimitResult = await rateLimit(request, {
  maxRequests: 100,        // Max requests in window
  windowMs: 60000,         // Time window (1 minute)
  message: 'Too many requests',
  skip: (req) => req.headers.get('x-api-key') === 'admin-key',
});
```

### Response Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800000
```

### ⚠️ Serverless Compatibility Warning

**The default rate limiting implementation does NOT work in serverless environments** (Vercel, AWS Lambda, Netlify Functions, etc.) because it uses in-memory storage which is reset on each function invocation.

**For serverless deployments, choose one of these alternatives:**

#### Option 1: Vercel KV (Recommended for Vercel)

```bash
npm install @vercel/kv
```

```typescript
// lib/api/middleware/rate-limit-vercel.ts
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function rateLimit(request: NextRequest, config: RateLimitConfig) {
  const clientId = getClientId(request);
  const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`;
  
  const count = await kv.incr(key);
  
  if (count === 1) {
    await kv.expire(key, Math.ceil(config.windowMs / 1000));
  }
  
  if (count > config.maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  return null;
}
```

#### Option 2: Upstash Redis (Works everywhere)

```bash
npm install @upstash/redis
```

```typescript
// lib/api/middleware/rate-limit-upstash.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(request: NextRequest, config: RateLimitConfig) {
  const clientId = getClientId(request);
  const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`;
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }
  
  if (count > config.maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  return null;
}
```

#### Option 3: Use Vercel's Built-in Rate Limiting

For Vercel deployments, use their native rate limiting in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-RateLimit-Limit",
          "value": "100"
        }
      ]
    }
  ]
}
```

Or use Vercel's Edge Config for more advanced rate limiting.

**The in-memory implementation is suitable for:**
- ✅ Development and testing
- ✅ Traditional server deployments (Docker, VPS)
- ✅ Single-instance applications
- ❌ NOT for serverless (Vercel, AWS Lambda, Netlify, etc.)

## CORS

Handle Cross-Origin Resource Sharing for API routes.

### Basic Usage

```typescript
import { applyCors, handleCors } from '@/lib/api/middleware';

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'hello' });
  return applyCors(request, response);
}
```

### Configuration

```typescript
const corsConfig = {
  allowedOrigins: ['https://example.com', 'https://app.example.com'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

return applyCors(request, response, corsConfig);
```

### Allow All Origins (Development Only)

```typescript
const corsConfig = {
  allowedOrigins: ['*'], // ⚠️ Not recommended for production
};
```

## Request Validation

Type-safe request validation using Zod schemas.

### Validate Request Body

```typescript
import { validateRequest } from '@/lib/api/middleware';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18).optional(),
});

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, {
    body: userSchema,
  });
  
  if (!validation.success) {
    return validation.error;
  }
  
  const { email, name, age } = validation.data!.body!;
  // Your logic here
}
```

### Validate Query Parameters

```typescript
const querySchema = z.object({
  page: z.string().transform(Number),
  limit: z.string().transform(Number),
  search: z.string().optional(),
});

const validation = await validateRequest(request, {
  query: querySchema,
});

if (!validation.success) return validation.error;

const { page, limit, search } = validation.data!.query!;
```

### Validate Headers

```typescript
const headerSchema = z.object({
  'x-api-key': z.string(),
  'x-request-id': z.string().uuid(),
});

const validation = await validateRequest(request, {
  headers: headerSchema,
});
```

### Validation Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "age",
      "message": "Must be at least 18 years old"
    }
  ]
}
```

## Authentication

Reusable authentication checks for API routes.

### Require Authentication

```typescript
import { requireAuth } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  // User is authenticated
}
```

### Get Authenticated User

```typescript
import { getAuthUser } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ userId: user.id, email: user.email });
}
```

### Require Specific Role

```typescript
import { requireRole } from '@/lib/api/middleware';

export async function DELETE(request: NextRequest) {
  const authError = await requireRole(request, 'admin');
  if (authError) return authError;
  
  // User is admin, continue with logic
  return NextResponse.json({ success: true });
}
```

Available roles: `user` (default), `admin`, `manager`, `guest`

Users can be promoted to different roles via Prisma Studio. See the Authentication documentation for details.

## Error Handling

Consistent error responses with automatic logging.

### Basic Usage

```typescript
import { handleApiError } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    const data = await someOperation();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Automatic Error Handling

The middleware automatically handles:

**Prisma Errors:**
```typescript
// P2002: Unique constraint violation
// Returns: 409 Conflict

// P2025: Record not found
// Returns: 404 Not Found

// P2003: Foreign key constraint
// Returns: 400 Bad Request
```

**Zod Validation Errors:**
```typescript
// Returns: 400 Bad Request with field-level errors
```

**Custom API Errors:**
```typescript
import { createApiError } from '@/lib/api/middleware';

throw createApiError('User not found', 404, 'USER_NOT_FOUND');
```

### Error Response Format

```json
{
  "error": "Record not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Request Logging

Automatic logging of API requests and responses with timing.

### Basic Usage

```typescript
import { withRequestLogging } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  return withRequestLogging(request, async () => {
    // Your logic here
    return NextResponse.json({ data: 'hello' });
  });
}
```

### Configuration

```typescript
const config = {
  skipPaths: ['/api/health', '/api/metrics'],
  logBody: false,      // Don't log request body (sensitive data)
  logResponse: false,  // Don't log response body
};

return withRequestLogging(request, handler, config);
```

### Log Output

```json
{
  "level": "info",
  "method": "POST",
  "path": "/api/users",
  "query": { "page": "1" },
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "msg": "API request"
}

{
  "level": "info",
  "method": "POST",
  "path": "/api/users",
  "status": 201,
  "duration": "45ms",
  "msg": "API response"
}
```

## Complete Example

Here's a production-ready API route using all middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware } from '@/lib/api/utils';
import { validateRequest, requireAuth, getAuthUser } from '@/lib/api/middleware';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Define validation schema
const createPostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  published: z.boolean().default(false),
});

// Wrap with automatic middleware
export const POST = withApiMiddleware(
  async (request: NextRequest) => {
    // Require authentication
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    const user = await getAuthUser(request);
    
    // Validate request
    const validation = await validateRequest(request, {
      body: createPostSchema,
    });
    
    if (!validation.success) {
      return validation.error;
    }
    
    const { title, content, published } = validation.data!.body!;
    
    // Create post in database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId: user!.id,
      },
    });
    
    return NextResponse.json(
      { message: 'Post created', data: post },
      { status: 201 }
    );
  },
  {
    // Rate limiting: 20 posts per hour
    rateLimit: {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    },
    // CORS for your frontend
    cors: {
      allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
    },
    // Automatic logging
    logging: true,
  }
);

// Handle preflight
export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}
```

## Best Practices

### 1. Always Use Rate Limiting

Protect your API from abuse:

```typescript
// Public endpoints: Strict limits
rateLimit: { maxRequests: 10, windowMs: 60000 }

// Authenticated endpoints: Moderate limits
rateLimit: { maxRequests: 100, windowMs: 60000 }

// Admin endpoints: Generous limits
rateLimit: { maxRequests: 1000, windowMs: 60000 }
```

### 2. Validate All Inputs

Never trust client data:

```typescript
// Always validate request body
const validation = await validateRequest(request, { body: schema });
if (!validation.success) return validation.error;
```

### 3. Use Specific CORS Origins

Don't use `'*'` in production:

```typescript
// ❌ Bad
cors: { allowedOrigins: ['*'] }

// ✅ Good
cors: { allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!] }
```

### 4. Handle Errors Consistently

Always use error handling:

```typescript
try {
  // Your logic
} catch (error) {
  return handleApiError(error);
}
```

### 5. Log Important Operations

Use logging for debugging and monitoring:

```typescript
logger.info({ userId, action: 'create_post' }, 'User created post');
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Rate limiting (optional - uses defaults if not set)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# CORS (optional)
CORS_ALLOWED_ORIGINS="https://example.com,https://app.example.com"

# Redis for distributed rate limiting (optional)
REDIS_URL="redis://localhost:6379"
```

## Using Standard Responses

All responses should use the standard format for consistency:

```typescript
import { apiSuccess, apiError, apiCreated, apiPaginated } from '@/lib/api';

// GET - Retrieve data
export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findUnique({ where: { id: '123' } });
    
    if (!user) {
      return apiError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    return apiSuccess(user, 'User retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const user = await prisma.user.create({ data });
    
    return apiCreated(user, 'User created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - List with pagination
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.user.count(),
  ]);
  
  return apiPaginated(users, page, limit, total);
}
```

## Common Patterns

### Public API with Rate Limiting

```typescript
import { withApiMiddleware, rateLimitPresets } from '@/lib/api';

export const GET = withApiMiddleware(
  async (request) => {
    return NextResponse.json({ data: 'public data' });
  },
  { rateLimit: rateLimitPresets.public } // 10 requests/min
);
```

### Protected API

```typescript
import { withApiMiddleware, requireAuth, rateLimitPresets } from '@/lib/api';

export const GET = withApiMiddleware(
  async (request) => {
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    return NextResponse.json({ data: 'protected data' });
  },
  { rateLimit: rateLimitPresets.authenticated } // 100 requests/min
);
```

### Validated POST Request

```typescript
import { withApiMiddleware, validateRequest, rateLimitPresets } from '@/lib/api';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export const POST = withApiMiddleware(
  async (request) => {
    const validation = await validateRequest(request, { body: schema });
    if (!validation.success) return validation.error;
    
    const { email, name } = validation.data!.body!;
    return NextResponse.json({ email, name });
  },
  { rateLimit: rateLimitPresets.write } // 20 requests/min
);
```

### CORS-Enabled API

```typescript
import { withApiMiddleware, handleCors } from '@/lib/api';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request, { allowedOrigins: ['https://example.com'] });
}

export const GET = withApiMiddleware(
  async (request) => {
    return NextResponse.json({ data: 'hello' });
  },
  { cors: { allowedOrigins: ['https://example.com'] } }
);
```

## Examples

Working examples in `app/api/examples/`:
- `rate-limited/` - Rate limiting demo
- `protected/` - Authentication demo
- `validated/` - Request validation demo
- `with-cors/` - CORS demo
- `complete/` - Complete middleware stack
- `standard-response/` - Standard response format demo

## Troubleshooting

### Rate Limiting Not Working

- Check if IP address is being detected correctly
- For production, consider using Redis instead of in-memory storage
- Verify rate limit headers in response

### CORS Errors

- Ensure origin is in `allowedOrigins` list
- Check that preflight (OPTIONS) handler is implemented
- Verify credentials setting matches your needs

### Validation Failing

- Check Zod schema matches your data structure
- Review validation error details in response
- Test schema with sample data

## Request Flow

```
Client Request
     ↓
Next.js API Route
     ↓
withApiMiddleware Wrapper
     ↓
1. Rate Limiting Check → Return 429 if exceeded
     ↓
2. Request Logging (Start timer)
     ↓
3. Your Handler Function
   ├─ Authentication (if needed)
   ├─ Validation (if needed)
   └─ Business Logic
     ↓
4. Error Handling (if error thrown)
     ↓
5. Apply Response Headers (CORS, Rate Limit)
     ↓
6. Request Logging (End, log duration)
     ↓
Response to Client
```

## Rate Limit Presets

```typescript
import { rateLimitPresets } from '@/lib/api/config';

rateLimitPresets.public        // 10 requests/min (strict)
rateLimitPresets.authenticated // 100 requests/min (moderate)
rateLimitPresets.write         // 20 requests/min (limited)
rateLimitPresets.admin         // 1000 requests/min (generous)
```

## Serverless vs Traditional Deployment

### What Works in Serverless

✅ **These middleware work perfectly in serverless:**
- CORS - Just header manipulation
- Validation - Stateless validation with Zod
- Authentication - Uses database/session store
- Error Handling - Stateless error formatting
- Request Logging - Logs to stdout (captured by platform)

❌ **This middleware needs modification for serverless:**
- Rate Limiting - Requires external store (Vercel KV, Upstash, DynamoDB)

### Deployment-Specific Notes

**Vercel:**
- Use Vercel KV for rate limiting
- Or use Vercel's built-in rate limiting
- All other middleware work as-is

**AWS Lambda:**
- Use DynamoDB for rate limiting
- Or use API Gateway rate limiting
- All other middleware work as-is

**Netlify Functions:**
- Use Upstash Redis for rate limiting
- All other middleware work as-is

**Traditional Server (Docker, VPS):**
- All middleware work as-is
- In-memory rate limiting is fine for single instance
- Use Redis for multi-instance deployments

## Production Checklist

### For Serverless Deployments (Vercel, AWS Lambda, Netlify)
- [ ] ⚠️ **CRITICAL**: Replace in-memory rate limiting with external store (Vercel KV, Upstash, DynamoDB)
- [ ] Configure specific CORS origins (no wildcards)
- [ ] Set appropriate rate limits for each endpoint
- [ ] Add authentication to sensitive endpoints
- [ ] Validate all user inputs
- [ ] Test error handling
- [ ] Monitor API performance and errors

### For Traditional Server Deployments (Docker, VPS)
- [ ] Use Redis for rate limiting if running multiple instances
- [ ] Configure specific CORS origins (no wildcards)
- [ ] Set appropriate rate limits for each endpoint
- [ ] Add authentication to sensitive endpoints
- [ ] Validate all user inputs
- [ ] Enable request logging
- [ ] Test error handling
- [ ] Monitor API performance and errors

## Standard Response Format

All API responses follow a consistent structure for both success and error cases.

### Success Response Structure

```typescript
{
  success: true,
  data: any,              // Your response data
  message?: string,       // Optional success message
  meta: {
    timestamp: string,    // ISO timestamp
    // Additional metadata (pagination, etc.)
  }
}
```

### Error Response Structure

```typescript
{
  success: false,
  error: string,          // Human-readable error message
  code?: string,          // Machine-readable error code
  details?: any,          // Additional error details
  meta: {
    timestamp: string     // ISO timestamp
  }
}
```

## Response Helpers

### Success Responses

```typescript
import { apiSuccess, apiCreated, apiPaginated } from '@/lib/api/response';

// Simple success
return apiSuccess({ id: '123', name: 'John' });
// Returns: { success: true, data: {...}, meta: { timestamp: '...' } }

// With message
return apiSuccess(user, 'User retrieved successfully');

// Created (201)
return apiCreated(newUser, 'User created successfully');

// Paginated
return apiPaginated(users, page, limit, total);
// Returns: { success: true, data: [...], meta: { timestamp: '...', pagination: {...} } }
```

### Error Responses

```typescript
import { apiError } from '@/lib/api/response';

// Simple error
return apiError('User not found', 404, 'USER_NOT_FOUND');
// Returns: { success: false, error: '...', code: '...', meta: { timestamp: '...' } }

// With details
return apiError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
```

## Response Examples

### Successful Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User retrieved successfully",
  "meta": {
    "timestamp": "2024-11-08T12:00:00.000Z"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "User 1" },
    { "id": "2", "name": "User 2" }
  ],
  "meta": {
    "timestamp": "2024-11-08T12:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Rate Limited Response
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0

{"error": "Too many requests, please try again later", "retryAfter": 45}
```

### Validation Error Response
```
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {"field": "email", "message": "Invalid email address"},
    {"field": "age", "message": "Must be at least 18 years old"}
  ],
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

## Learn More

- [Zod Documentation](https://zod.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
