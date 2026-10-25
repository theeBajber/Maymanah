import "server-only";

import { NextResponse } from "next/server";

import { QuranAuthError } from "./auth";
import { QuranApiError } from "./client";
import { QuranConfigError } from "./config";

function errorResponse(
  error: string,
  code: string,
  status: number,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ error, code }, { status, headers });
}

export function quranErrorResponse(
  error: unknown,
  context: string,
): NextResponse {
  if (error instanceof QuranConfigError) {
    console.error(`${context}: ${error.message}`);
    return errorResponse(
      "Quran Foundation is not configured.",
      "QF_CONFIG",
      503,
    );
  }

  if (error instanceof QuranAuthError) {
    console.error(`${context}: ${error.message}`);
    return errorResponse(
      "Quran Foundation authentication is unavailable.",
      "QF_AUTH",
      503,
    );
  }

  if (error instanceof QuranApiError) {
    console.error(`${context}: ${error.message}`);

    if (error.code === "QF_RATE_LIMITED") {
      const headers = error.retryAfterSeconds
        ? { "Retry-After": String(error.retryAfterSeconds) }
        : undefined;
      return errorResponse(
        "Quran Foundation is busy. Please try again shortly.",
        error.code,
        error.httpStatus,
        headers,
      );
    }

    if (error.code === "QF_NOT_FOUND") {
      return errorResponse(
        "The requested Quran resource was not found.",
        error.code,
        error.httpStatus,
      );
    }

    return errorResponse(
      "Quran Foundation is unavailable.",
      error.code,
      error.httpStatus,
    );
  }

  console.error(`${context}:`, error);
  return errorResponse("Internal server error.", "QF_INTERNAL", 500);
}
