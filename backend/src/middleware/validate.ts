import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody = <T>(schema: ZodType<T>): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(result.error);
  req.body = result.data;
  next();
};

export const validateQuery = <T>(schema: ZodType<T>): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return next(result.error);
  Object.assign(req.query, result.data);
  next();
};
