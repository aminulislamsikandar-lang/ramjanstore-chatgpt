import rateLimit from "express-rate-limit";

const standardOptions = { standardHeaders: "draft-8" as const, legacyHeaders: false };
const response = (code: string, message: string) => ({ success: false, error: { code, message } });

export const apiRateLimiter = rateLimit({ ...standardOptions, windowMs: 15 * 60 * 1000, limit: 300, message: response("RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.") });
export const authRateLimiter = rateLimit({ ...standardOptions, windowMs: 15 * 60 * 1000, limit: 30, message: response("AUTH_RATE_LIMIT_EXCEEDED", "Too many authentication attempts. Please try again later.") });
export const writeRateLimiter = rateLimit({ ...standardOptions, windowMs: 5 * 60 * 1000, limit: 60, message: response("WRITE_RATE_LIMIT_EXCEEDED", "Too many write requests. Please try again later.") });
export const checkoutRateLimiter = rateLimit({ ...standardOptions, windowMs: 10 * 60 * 1000, limit: 20, message: response("CHECKOUT_RATE_LIMIT_EXCEEDED", "Too many checkout attempts. Please try again later.") });
export const uploadSignatureRateLimiter = rateLimit({ ...standardOptions, windowMs: 10 * 60 * 1000, limit: 20, message: response("UPLOAD_RATE_LIMIT_EXCEEDED", "Too many upload requests. Please try again later.") });
