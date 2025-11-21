/**
 * Simple Console-Based Logger for Vercel Compatibility
 *
 * This logger provides structured JSON logging that works perfectly on Vercel
 * and other serverless platforms by outputting directly to stdout/stderr.
 *
 * Features:
 * - Zero external dependencies (no Pino, no next-logger)
 * - Structured JSON logs for easy parsing
 * - Automatic sensitive field redaction
 * - Child logger support for request context
 * - Environment-aware logging levels
 * - Compatible with Vercel, AWS Lambda, and all serverless platforms
 *
 * Usage:
 * ```typescript
 * import { logger } from '@lib/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to process', { error: err.message });
 *
 * // Create child logger with context
 * const requestLogger = logger.child({ requestId: '123' });
 * requestLogger.info('Processing request');
 * ```
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  time: string;
  msg: string;
  [key: string]: unknown;
}

interface Logger {
  trace(message: string, context?: Record<string, unknown>): void;
  trace(context: Record<string, unknown>, message: string): void;
  debug(message: string, context?: Record<string, unknown>): void;
  debug(context: Record<string, unknown>, message: string): void;
  info(message: string, context?: Record<string, unknown>): void;
  info(context: Record<string, unknown>, message: string): void;
  warn(message: string, context?: Record<string, unknown>): void;
  warn(context: Record<string, unknown>, message: string): void;
  error(message: string, context?: Record<string, unknown>): void;
  error(context: Record<string, unknown>, message: string): void;
  fatal(message: string, context?: Record<string, unknown>): void;
  fatal(context: Record<string, unknown>, message: string): void;
  child(context: Record<string, unknown>): Logger;
}

// Log level priority (lower number = lower priority)
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

// Sensitive fields to redact
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'passwordHash',
  'accessToken',
  'refreshToken',
];

const isDevelopment = process.env.NODE_ENV === 'development';
const configuredLevel = (process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')) as LogLevel;
const currentLogLevel = LOG_LEVELS[configuredLevel] || LOG_LEVELS.info;

/**
 * Redact sensitive fields from an object
 */
function redactSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redactSensitiveFields(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Create a logger instance with optional context
 */
function createLoggerInstance(baseContext: Record<string, unknown> = {}): Logger {
  /**
   * Internal log function that handles the actual logging
   */
  function log(level: LogLevel, ...args: unknown[]): void {
    // Skip if log level is below threshold
    if (LOG_LEVELS[level] < currentLogLevel) {
      return;
    }

    let message: string;
    let context: Record<string, unknown> = {};

    // Handle both (message, context) and (context, message) signatures
    if (typeof args[0] === 'string') {
      message = args[0];
      context = (args[1] as Record<string, unknown>) || {};
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      context = args[0] as Record<string, unknown>;
      message = (args[1] as string) || '';
    } else {
      message = String(args[0] || '');
    }

    // Combine base context with log-specific context
    const fullContext = { ...baseContext, ...context };

    // Redact sensitive fields
    const safeContext = redactSensitiveFields(fullContext);

    // Create log entry
    const entry: LogEntry = {
      level,
      time: new Date().toISOString(),
      msg: message,
      ...safeContext,
    };

    // Output to console (stdout for info/debug, stderr for warn/error/fatal)
    const output = JSON.stringify(entry);

    if (level === 'error' || level === 'fatal' || level === 'warn') {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  return {
    trace: (...args: unknown[]) => log('trace', ...args),
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
    fatal: (...args: unknown[]) => log('fatal', ...args),
    child: (childContext: Record<string, unknown>) => {
      return createLoggerInstance({ ...baseContext, ...childContext });
    },
  } as Logger;
}

/**
 * Default application logger
 *
 * Use this throughout your application for logging:
 * - logger.info('message', { context })
 * - logger.error('error message', { error: err })
 * - logger.debug('debug info')
 */
export const logger = createLoggerInstance({ name: 'app' });

/**
 * Create a child logger with additional context
 *
 * Child loggers inherit the parent configuration but add persistent context
 * to all log messages, making it easy to track related operations.
 *
 * @example
 * const requestLogger = createLogger({ requestId: '123', userId: 'abc' });
 * requestLogger.info('Processing request');
 * // Output includes: {"level":"info","requestId":"123","userId":"abc","msg":"Processing request"}
 */
export function createLogger(context: Record<string, unknown>): Logger {
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
 *
 * Example:
 * - LOG_LEVEL=debug (shows all logs except trace)
 * - LOG_LEVEL=info (shows info, warn, error, fatal - recommended for production)
 * - LOG_LEVEL=error (shows only error and fatal)
 */
