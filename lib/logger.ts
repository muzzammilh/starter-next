import pino from "pino";
import { createStreams } from "./logger/transports";

/**
 * Application logger using next-logger + Pino
 * 
 * next-logger patches Next.js's internal logger to use Pino (loaded via instrumentation.ts),
 * providing structured JSON logs from the Next.js framework itself.
 * 
 * This logger instance is for your application code and uses the same configuration
 * as next-logger (defined in next-logger.config.js).
 * 
 * Features:
 * - Structured JSON logs from Next.js framework and your application
 * - High-performance async logging with zero overhead
 * - Automatic integration with Next.js build and runtime logs
 * - JSON format in all environments (compatible with Next.js Turbopack)
 * - File logging with rotation policies (Django-style)
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@lib/logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to process', { error: err.message });
 * ```
 * 
 * Customization:
 * - Set LOG_LEVEL in .env.local (debug, info, warn, error)
 * - Set LOG_TO_FILE=true to enable file logging
 * - Configure LOG_DIR, LOG_FILE_MAX_SIZE, LOG_FILE_MAX_FILES for rotation
 * - Edit next-logger.config.js for Pino configuration
 * - Add custom serializers for sensitive data
 * - Configure transports for external log services
 * 
 * Note: We use JSON format for all logging. This provides structured logs
 * that work seamlessly with log aggregation tools and avoids any compatibility
 * issues with Next.js development mode.
 */

const isDevelopment = process.env.NODE_ENV === "development";
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

// Create logger with JSON format for all environments
// JSON logs are structured, fast, and work with all log aggregation tools
export const logger = pino(
  {
    level: logLevel,
    name: "app",
    // Redact sensitive fields
    redact: {
      paths: ["password", "token", "apiKey", "secret", "authorization"],
      censor: "[REDACTED]",
    },
  },
  createStreams()
);

/**
 * Create a child logger with additional context
 * 
 * Child loggers inherit the parent configuration but add persistent context
 * to all log messages, making it easy to track related operations.
 * 
 * @example
 * const requestLogger = createLogger({ requestId: '123', userId: 'abc' });
 * requestLogger.info('Processing request');
 * // Output includes: {"requestId":"123","userId":"abc","msg":"Processing request"}
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log levels (from lowest to highest priority):
 * - trace (10): Very detailed debugging information
 * - debug (20): Debugging information for development
 * - info (30): General informational messages (default in production)
 * - warn (40): Warning messages for potentially harmful situations
 * - error (50): Error messages for failures
 * - fatal (60): Fatal errors that cause application termination
 * 
 * Set LOG_LEVEL environment variable to control which logs appear.
 * Only logs at or above the configured level will be output.
 */
