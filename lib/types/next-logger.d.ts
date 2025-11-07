/**
 * Type declarations for next-logger
 * 
 * next-logger doesn't ship with TypeScript definitions,
 * so we provide basic types here.
 * 
 * next-logger patches Next.js's internal logger to use Pino.
 * It's loaded via the instrumentation hook, not imported directly.
 */

declare module "next-logger" {
  /**
   * next-logger patches Next.js logger when imported.
   * No exports are needed - just import it in instrumentation.ts
   */
}
