import pino from "pino";

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
 * - Pretty printing in development, JSON in production
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to process', { error: err.message });
 * ```
 * 
 * Customization:
 * - Set LOG_LEVEL in .env.local (debug, info, warn, error)
 * - Edit next-logger.config.js for Pino configuration
 * - Add custom serializers for sensitive data
 * - Configure transports for external log services
 */

const isDevelopment = process.env.NODE_ENV === "development";
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

export const logger = pino({
  level: logLevel,
  name: "app",
  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,
  // Redact sensitive fields (same as next-logger config)
  redact: {
    paths: ["password", "token", "apiKey", "secret", "authorization"],
    censor: "[REDACTED]",
  },
});

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
