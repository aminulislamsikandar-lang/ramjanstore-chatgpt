import type { Response } from "express";

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

export interface ApiFailureBody {
  success: false;
  error: ApiErrorBody;
}

export function success<T>(res: Response, data: T, statusCode = 200): Response<ApiSuccessBody<T>> {
  return res.status(statusCode).json({ success: true, data });
}

export function failure(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response<ApiFailureBody> {
  const requestId = res.locals.requestId as string | undefined;
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  });
}
