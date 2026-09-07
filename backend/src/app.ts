import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS ?? `${process.env.CLIENT_URL ?? "http://localhost:5173"},${process.env.ADMIN_URL ?? "http://localhost:5174"}`)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS policy."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.use((req: Request, res: Response, next) => {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  res.locals.requestId = requestId;
  next();
});

app.use(express.json({ limit: "1mb", strict: true }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." },
  },
}));

app.use((req: Request, res: Response, next) => {
  const startedAt = process.hrtime.bigint();
  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.info("HTTP request", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  next();
});

const api = express.Router();

api.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: "ramjanstore-api",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Feature routers will be mounted here as each domain is implemented.
app.use("/api/v1", api);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "The requested API endpoint was not found." },
  });
});

app.use(errorHandler);

export { app };
export default app;
