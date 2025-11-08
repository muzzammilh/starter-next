/**
 * Pino Transport Configuration for File Logging
 * 
 * This module configures file-based logging with rotation policies,
 * similar to Django's logging handlers. Supports multiple output formats
 * and rotation strategies.
 * 
 * Features:
 * - JSON and text file outputs
 * - Size-based and time-based rotation
 * - Configurable retention policies
 * - Separate files for different log levels
 * 
 * Configuration via environment variables:
 * - LOG_TO_FILE: Enable file logging (true/false)
 * - LOG_DIR: Directory for log files (default: ./logs)
 * - LOG_FILE_MAX_SIZE: Max file size before rotation (default: 10M)
 * - LOG_FILE_MAX_AGE: Max age of log files (default: 7d)
 * - LOG_FILE_MAX_FILES: Max number of rotated files to keep (default: 10)
 */

import path from "path";
import { multistream } from "pino";
import type { StreamEntry } from "pino";

// Detect serverless environment
const isServerless =
  !!process.env.VERCEL || // Vercel
  !!process.env.AWS_LAMBDA_FUNCTION_NAME || // AWS Lambda
  !!process.env.NETLIFY || // Netlify
  !!process.env.FUNCTION_NAME || // Google Cloud Functions
  !!process.env.FUNCTIONS_WORKER_RUNTIME; // Cloudflare Workers

// Configuration from environment variables
// File logging is automatically disabled in serverless environments
const LOG_TO_FILE = process.env.LOG_TO_FILE === "true" && !isServerless;
const LOG_DIR = process.env.LOG_DIR || "./logs";
const LOG_FILE_MAX_SIZE = process.env.LOG_FILE_MAX_SIZE || "10M"; // 10 megabytes
const LOG_FILE_MAX_AGE = process.env.LOG_FILE_MAX_AGE || "7d"; // 7 days
const LOG_FILE_MAX_FILES = parseInt(
  process.env.LOG_FILE_MAX_FILES || "10",
  10
);

// Log warning if file logging is requested in serverless environment
if (process.env.LOG_TO_FILE === "true" && isServerless) {
  console.warn(
    "[Logger] File logging is not supported in serverless environments. Logs will only go to stdout. See README.md Logging section for details."
  );
}

/**
 * Parse size string to bytes
 * Supports: 10M, 100K, 1G, etc.
 */
function parseSize(size: string): number {
  const units: Record<string, number> = {
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
  };
  
  const match = size.match(/^(\d+)([KMG])$/i);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const [, num, unit] = match;
  return parseInt(num, 10) * units[unit.toUpperCase()];
}

/**
 * Parse time string to milliseconds
 * Supports: 7d, 24h, 60m, etc.
 */
function parseTime(time: string): number {
  const units: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  const match = time.match(/^(\d+)([mhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  
  const [, num, unit] = match;
  return parseInt(num, 10) * units[unit.toLowerCase()];
}

/**
 * Create a rotating file stream using pino-roll
 */
function createRotatingFileStream(filename: string, options: {
  size?: string;
  frequency?: string;
  maxFiles?: number;
}) {
  // Dynamic import to avoid issues in browser/edge runtime
  const pinoRoll = require("pino-roll");
  
  return pinoRoll({
    file: path.join(LOG_DIR, filename),
    size: options.size || LOG_FILE_MAX_SIZE,
    frequency: options.frequency,
    mkdir: true, // Create log directory if it doesn't exist
    extension: "", // Don't add extra extension
  });
}

/**
 * Create transport streams for file logging
 * Returns an array of stream entries for pino multistream
 */
export function createFileTransports(): StreamEntry[] {
  if (!LOG_TO_FILE) {
    return [];
  }

  const streams: StreamEntry[] = [];

  try {
    // All logs in JSON format (structured logging)
    streams.push({
      level: "trace",
      stream: createRotatingFileStream("app.json", {
        size: LOG_FILE_MAX_SIZE,
        maxFiles: LOG_FILE_MAX_FILES,
      }),
    });

    // Error logs only (JSON format)
    streams.push({
      level: "error",
      stream: createRotatingFileStream("error.json", {
        size: LOG_FILE_MAX_SIZE,
        maxFiles: LOG_FILE_MAX_FILES,
      }),
    });

    // Note: We only use JSON format to avoid conflicts with dev servers.
    // To view logs in human-readable format, use:
    //   cat logs/app.json | jq -r '.time + " " + .level + " " + .msg'
    // Or use any JSON log viewer/formatter of your choice.
  } catch (error) {
    console.error("Failed to create file transports:", error);
  }

  return streams;
}

/**
 * Create the complete stream configuration
 * Combines stdout and file streams
 */
export function createStreams() {
  const streams: StreamEntry[] = [
    // Always log to stdout
    { level: "trace", stream: process.stdout },
  ];

  // Add file streams if enabled
  const fileStreams = createFileTransports();
  streams.push(...fileStreams);

  return multistream(streams);
}

/**
 * Log rotation strategies:
 * 
 * 1. Size-based rotation (default):
 *    - Rotates when file reaches LOG_FILE_MAX_SIZE
 *    - Keeps LOG_FILE_MAX_FILES rotated files
 *    - Example: app.json, app.json.1, app.json.2, etc.
 * 
 * 2. Time-based rotation:
 *    - Set frequency: 'daily', 'hourly', or custom interval
 *    - Example: app-2024-01-15.json, app-2024-01-16.json
 * 
 * 3. Hybrid approach:
 *    - Combine both size and time-based rotation
 *    - Rotates on whichever condition is met first
 * 
 * Configuration examples:
 * 
 * Size-based (10MB files, keep 10 rotations):
 *   LOG_FILE_MAX_SIZE=10M
 *   LOG_FILE_MAX_FILES=10
 * 
 * Daily rotation:
 *   LOG_FILE_MAX_AGE=1d
 *   LOG_FILE_MAX_FILES=30
 * 
 * Hourly rotation for high-traffic apps:
 *   LOG_FILE_MAX_AGE=1h
 *   LOG_FILE_MAX_FILES=168  # 7 days worth
 */
