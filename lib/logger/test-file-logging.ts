/**
 * Test script for file logging
 * 
 * Run this script to test file logging functionality:
 * 
 * 1. Set LOG_TO_FILE=true in .env.local
 * 2. Run: npx tsx lib/logger/test-file-logging.ts
 * 3. Check logs/ directory for generated files
 */

import { logger, createLogger } from "../logger";

async function testFileLogging() {
  console.log("Testing file logging...\n");
  console.log("Configuration:");
  console.log("- LOG_TO_FILE:", process.env.LOG_TO_FILE);
  console.log("- LOG_DIR:", process.env.LOG_DIR || "./logs");
  console.log("- LOG_LEVEL:", process.env.LOG_LEVEL || "debug");
  console.log("\nGenerating test logs...\n");

  // Test different log levels
  logger.trace("This is a trace message");
  logger.debug("This is a debug message");
  logger.info("This is an info message");
  logger.warn("This is a warning message");
  logger.error("This is an error message");

  // Test structured logging
  logger.info({ userId: "123", action: "test" }, "Structured log message");

  // Test child logger
  const childLogger = createLogger({ component: "test", requestId: "abc-123" });
  childLogger.info("Message from child logger");
  childLogger.error({ error: "Test error" }, "Error from child logger");

  // Test sensitive data redaction
  logger.info({
    username: "testuser",
    password: "secret123", // Should be redacted
    token: "abc123",       // Should be redacted
    email: "test@example.com",
  }, "Login attempt with sensitive data");

  console.log("\nTest logs generated!");
  console.log("\nIf LOG_TO_FILE=true, check the following files:");
  console.log("- logs/app.json (all logs in JSON format)");
  console.log("- logs/error.json (error logs only)");
  console.log("\nTo view in human-readable format:");
  console.log("  cat logs/app.json | jq -r '.time + \" \" + .level + \" \" + .msg'");
  console.log("\nIf LOG_TO_FILE=false, logs only appear in stdout (above).");
}

testFileLogging().catch(console.error);
