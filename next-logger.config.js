/**
 * next-logger configuration
 * 
 * This configures how Next.js's internal logger is patched with Pino.
 * The configuration is automatically picked up by next-logger.
 * 
 * @see https://github.com/sainsburys-tech/next-logger
 */

const pino = require("pino");

const isDevelopment = process.env.NODE_ENV === "development";
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

/**
 * Custom Pino logger configuration
 * This function receives the default config and returns a Pino instance
 */
const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    level: logLevel,
    // Pretty print in development, JSON in production
    ...(isDevelopment
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
              singleLine: false,
            },
          },
        }
      : {}),
    // Redact sensitive fields
    redact: {
      paths: ["password", "token", "apiKey", "secret", "authorization"],
      censor: "[REDACTED]",
    },
  });

module.exports = {
  logger,
};
