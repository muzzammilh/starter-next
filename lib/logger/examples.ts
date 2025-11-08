/**
 * Logging Examples
 * 
 * Practical examples of using the logger in different scenarios
 */

import { logger, createLogger } from "../logger";

/**
 * Example 1: Basic logging in API routes
 */
export async function apiRouteExample(request: Request) {
  // Create a logger with request context
  const requestLogger = createLogger({
    path: new URL(request.url).pathname,
    method: request.method,
    requestId: crypto.randomUUID(),
  });

  requestLogger.info("Incoming request");

  try {
    // Your business logic here
    const data = await request.json();
    
    requestLogger.debug({ data }, "Request payload");
    
    // Process...
    
    requestLogger.info("Request processed successfully");
    
    return Response.json({ success: true });
  } catch (error) {
    requestLogger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, "Request failed");
    
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Example 2: Database operations logging
 */
export async function databaseExample() {
  const dbLogger = createLogger({ component: "database" });

  dbLogger.debug("Connecting to database");

  try {
    // Simulate database operation
    dbLogger.info({ 
      query: "SELECT * FROM users WHERE id = ?",
      params: [123] 
    }, "Executing query");

    // Query execution...
    
    dbLogger.info({ 
      rowCount: 1,
      duration: "45ms" 
    }, "Query completed");
  } catch (error) {
    dbLogger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      code: (error as any).code,
    }, "Database error");
    throw error;
  }
}

/**
 * Example 3: Authentication logging
 */
export async function authExample(email: string) {
  const authLogger = createLogger({ 
    component: "auth",
    email 
  });

  authLogger.info("Login attempt");

  try {
    // Verify credentials...
    
    authLogger.info({ 
      userId: "user-123",
      provider: "credentials" 
    }, "Login successful");
  } catch (error) {
    authLogger.warn({ 
      reason: "invalid_credentials" 
    }, "Login failed");
    throw error;
  }
}

/**
 * Example 4: Background job logging
 */
export async function backgroundJobExample() {
  const jobLogger = createLogger({
    component: "background-job",
    jobId: crypto.randomUUID(),
    jobType: "email-notifications",
  });

  jobLogger.info("Job started");

  const startTime = Date.now();
  let processed = 0;
  let failed = 0;

  try {
    // Process items...
    for (let i = 0; i < 100; i++) {
      try {
        // Process item...
        processed++;
        
        if (i % 10 === 0) {
          jobLogger.debug({ 
            processed,
            total: 100,
            percentage: (processed / 100) * 100 
          }, "Progress update");
        }
      } catch (error) {
        failed++;
        jobLogger.warn({ 
          itemId: i,
          error: error instanceof Error ? error.message : "Unknown error" 
        }, "Item processing failed");
      }
    }

    const duration = Date.now() - startTime;
    
    jobLogger.info({
      processed,
      failed,
      duration: `${duration}ms`,
      successRate: `${((processed / 100) * 100).toFixed(2)}%`,
    }, "Job completed");
  } catch (error) {
    jobLogger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      processed,
      failed,
    }, "Job failed");
    throw error;
  }
}

/**
 * Example 5: External API call logging
 */
export async function externalApiExample() {
  const apiLogger = createLogger({
    component: "external-api",
    service: "stripe",
  });

  apiLogger.info({
    endpoint: "/v1/customers",
    method: "POST",
  }, "Calling external API");

  const startTime = Date.now();

  try {
    // Make API call...
    const response = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      // ... headers, body
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      apiLogger.warn({
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
      }, "API returned error status");
      throw new Error(`API error: ${response.status}`);
    }

    apiLogger.info({
      status: response.status,
      duration: `${duration}ms`,
    }, "API call successful");

    return await response.json();
  } catch (error) {
    const duration = Date.now() - startTime;
    
    apiLogger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    }, "API call failed");
    throw error;
  }
}

/**
 * Example 6: Performance monitoring
 */
export async function performanceExample() {
  const perfLogger = createLogger({ component: "performance" });

  const startTime = performance.now();

  // Your operation...
  await new Promise(resolve => setTimeout(resolve, 100));

  const duration = performance.now() - startTime;

  if (duration > 100) {
    perfLogger.warn({
      operation: "data-processing",
      duration: `${duration.toFixed(2)}ms`,
      threshold: "100ms",
    }, "Slow operation detected");
  } else {
    perfLogger.debug({
      operation: "data-processing",
      duration: `${duration.toFixed(2)}ms`,
    }, "Operation completed");
  }
}

/**
 * Example 7: User action tracking
 */
export function userActionExample(userId: string, action: string) {
  const actionLogger = createLogger({
    component: "user-actions",
    userId,
  });

  actionLogger.info({
    action,
    timestamp: new Date().toISOString(),
  }, "User action");
}

/**
 * Example 8: Error with context
 */
export function errorWithContextExample() {
  try {
    // Some operation that might fail
    throw new Error("Something went wrong");
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        userId: "user-123",
        operation: "payment-processing",
        amount: 100,
        currency: "USD",
      },
    }, "Operation failed with context");
  }
}

/**
 * Example 9: Conditional logging based on environment
 */
export function conditionalLoggingExample() {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    logger.debug({
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    }, "Detailed debug information");
  }

  // Always log important events
  logger.info("Important event occurred");
}

/**
 * Example 10: Logging with sensitive data redaction
 */
export function sensitiveDataExample() {
  // These fields are automatically redacted (see logger.ts)
  logger.info({
    email: "user@example.com",
    password: "secret123", // Will be [REDACTED]
    token: "abc123",       // Will be [REDACTED]
    name: "John Doe",      // Will be logged normally
  }, "User registration");
}
