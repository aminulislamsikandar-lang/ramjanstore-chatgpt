import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

interface ApiError extends Error {
  statusCode?: number;
  status?: number;
  code?: string | number;
  isOperational?: boolean;
  details?: unknown;
}

interface ErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown; requestId?: string };
}

const firestoreStatuses: Record<string, number> = {
  "7": 403, // PERMISSION_DENIED
  "16": 401, // UNAUTHENTICATED
  "5": 404, // NOT_FOUND
  "6": 409, // ALREADY_EXISTS
  "9": 412, // FAILED_PRECONDITION
  "8": 429, // RESOURCE_EXHAUSTED
  "4": 504, // DEADLINE_EXCEEDED
  "14": 503, // UNAVAILABLE
};

function firestoreStatus(code: string | number): number {
  const normalized = String(code).toLowerCase().replace(/^firestore\//, "");
  const named: Record<string, number> = {
    "not-found": 404, "already-exists": 409, "permission-denied": 403,
    unauthenticated: 401, "failed-precondition": 412, "resource-exhausted": 429,
    "deadline-exceeded": 504, unavailable: 503,
  };
  return named[normalized] ?? firestoreStatuses[normalized] ?? 500;
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next): void => {
  const requestId = req.header("x-request-id") ?? res.locals.requestId;
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";
  let details: unknown;

  if (error instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Request validation failed.";
    details = error.issues.map(({ path, message: issueMessage, code: issueCode }) => ({ path, message: issueMessage, code: issueCode }));
  } else if (error && typeof error === "object" && "code" in error && "message" in error) {
    const candidate = error as { code: string | number; message: string };
    const looksFirestore = typeof candidate.code === "number" || String(candidate.code).startsWith("firestore/") || ["5", "6", "7", "8", "9", "14", "16"].includes(String(candidate.code));
    if (looksFirestore) {
      statusCode = firestoreStatus(candidate.code);
      code = `FIRESTORE_${String(candidate.code).replaceAll("/", "_").replaceAll("-", "_").toUpperCase()}`;
      message = statusCode >= 500 ? "A database service error occurred." : candidate.message;
    }
  }

  if (error instanceof Error && statusCode === 500) {
    const apiError = error as ApiError;
    statusCode = apiError.statusCode ?? apiError.status ?? 500;
    code = typeof apiError.code === "string" ? apiError.code : (apiError.isOperational ? "API_ERROR" : "INTERNAL_SERVER_ERROR");
    message = apiError.isOperational || statusCode < 500 ? apiError.message : "An unexpected error occurred.";
    details = apiError.details;
  }

  const body: ErrorResponse = { success: false, error: { code, message, ...(details !== undefined ? { details } : {}), ...(requestId ? { requestId } : {}) } };
  if (statusCode >= 500) console.error("Unhandled API error", { requestId, method: req.method, path: req.originalUrl, error });
  res.status(statusCode).json(body);
};
