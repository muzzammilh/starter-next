import { NextRequest, NextResponse } from "next/server";
import { logger } from "@lib/logger";

/**
 * Example API route demonstrating logger usage
 * 
 * This is a template showing how to use the logger in API routes.
 * Delete or modify this file for your actual API endpoints.
 */

export async function GET(request: NextRequest) {
  // Create a request-specific logger with context
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    endpoint: "/api/example",
  });

  try {
    requestLogger.info("Processing GET request");

    // Example: Log with additional data
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (userId) {
      requestLogger.debug({ userId }, "User ID provided");
    }

    // Simulate some work
    const data = {
      message: "Success",
      timestamp: new Date().toISOString(),
    };

    requestLogger.info({ responseData: data }, "Request completed successfully");

    return NextResponse.json(data);
  } catch (error) {
    // Log errors with full context
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Request failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    endpoint: "/api/example",
  });

  try {
    const body = await request.json();
    
    requestLogger.info({ bodyKeys: Object.keys(body) }, "Processing POST request");

    // Your business logic here
    
    requestLogger.info("POST request completed");

    return NextResponse.json({ success: true });
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "POST request failed"
    );

    return NextResponse.json(
      { error: "Bad request" },
      { status: 400 }
    );
  }
}
