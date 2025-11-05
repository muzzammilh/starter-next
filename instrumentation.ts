/**
 * Next.js Instrumentation Hook
 * 
 * This file is automatically loaded by Next.js when the instrumentationHook
 * experimental feature is enabled in next.config.ts.
 * 
 * We use it to patch Next.js's internal logger with Pino via next-logger,
 * providing structured JSON logging throughout the application.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://github.com/sainsburys-tech/next-logger
 */

export async function register() {
  // Only patch logger in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Load pino first
    await import("pino");
    // Then load next-logger to patch Next.js logger
    await import("next-logger");
  }
}
