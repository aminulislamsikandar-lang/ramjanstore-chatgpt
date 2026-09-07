import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." } },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "AUTH_RATE_LIMIT_EXCEEDED", message: "Too many authentication attempts. Please try again later." } },
});
