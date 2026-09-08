export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational = true;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new ApiError(400, code, message, details);
export const unauthorized = (code = "UNAUTHORIZED", message = "Authentication is required.") =>
  new ApiError(401, code, message);
export const forbidden = (code = "FORBIDDEN", message = "You do not have permission to perform this action.") =>
  new ApiError(403, code, message);
export const notFound = (code: string, message: string) => new ApiError(404, code, message);
export const conflict = (code: string, message: string, details?: unknown) =>
  new ApiError(409, code, message, details);
export const tooManyRequests = (code = "RATE_LIMITED", message = "Too many requests. Please try again later.") =>
  new ApiError(429, code, message);
