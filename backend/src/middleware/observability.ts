import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const observability: RequestHandler = (req, res, next) => {
  const incoming = req.get("X-Request-ID");
  const requestId = incoming && /^[A-Za-z0-9._:-]{1,128}$/.test(incoming) ? incoming : randomUUID();
  const started = process.hrtime.bigint();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    console.info(JSON.stringify({ event: "http_request", requestId, method: req.method, path: req.route?.path ?? req.path, statusCode: res.statusCode, durationMs: Math.round(durationMs * 100) / 100 }));
  });
  next();
};
