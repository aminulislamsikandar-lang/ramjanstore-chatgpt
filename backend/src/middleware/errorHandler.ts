import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

interface ApiError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  isOperational?: boolean;
  details?: unknown;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

function isFirestoreError(error: unknown): error is { code: string; message: string } {
  if (!error || typeof error !== "object") return false;
  const candidate = error as Record<string, unknown>;
  return typeof candidate.code === "string" && candidate.code.startsWith("firestore/");
}

function firestoreStatus(code: string): number {
  switch (code) {
    case "firestore/not-found": return 404;
    case "firestore/already-exists": return 409;
    case "firestore/permission-denied": return 403;
    case "firestore/unauthenticated": return 401;
    case "firestore/failed-precondition": return 412;
    case "firestore/resource-exhausted": return 429;
    case "firestore/deadline-exceeded": return 504;
    case "firestore/unavailable": return 503;
    default: return 500;
  }
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.header("x-request-id") ?? undefined;
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";
  let details: unknown;

  if (error instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Request validation failed.";
    details = error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
    }));
  } else if (isFirestoreError(error)) {
    statusCode = firestoreStatus(error.code);
    code = error.code.replace(/^firestore\//, "FIRESTORE_").toUpperCase().replace(/-/g, "_");
    message = statusCode >= 500 ? "A database service error occurred." : error.message;
  } else if (error instanceof Error) {
    const apiError = error as ApiError;
    statusCode = apiError.statusCode ?? apiError.status ?? 500;
    code = apiError.code ?? (apiError.isOperational ? "API_ERROR" : "INTERNAL_SERVER_ERROR");
    message = apiError.isOperational || statusCode < 500 ? apiError.message : "An unexpected error occurred.";
    details = apiError.details;
  }

  const body: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
      ...(requestId ? { requestId } : {}),
    },
  };

  if (statusCode >= 500) {
    console.error("Unhandled API error", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }

  res.status(statusCode).json(body);
};
