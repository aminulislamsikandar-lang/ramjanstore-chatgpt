import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

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

export const validateParams = <T>(schema: ZodType<T>): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) return next(result.error);
  Object.assign(req.params, result.data);
  next();
};

export const idParamSchema = z.object({ id: z.string().trim().min(1).max(128) }).strict();
export const orderIdParamSchema = z.object({ orderId: z.string().trim().min(1).max(128) }).strict();
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().trim().min(1).max(256).optional(),
}).strict();
