export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational = true;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }
}

export const badRequest = (message: string, details?: unknown) => new ApiError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Authentication required") => new ApiError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Access denied") => new ApiError(403, "FORBIDDEN", message);
export const notFound = (message = "Resource not found") => new ApiError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new ApiError(409, "CONFLICT", message);
