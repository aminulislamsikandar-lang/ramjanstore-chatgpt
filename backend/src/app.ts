import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

const app = express();

const allowedOrigins = (env.CLIENT_URLS ?? `${env.CLIENT_URL},${env.ADMIN_URL}`)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS policy."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "Idempotency-Key"],
}));
app.use(requestLogger);
app.use(express.json({ limit: "1mb", strict: true }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(apiRateLimiter);

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: "ramjanstore-api", status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);

export { app };
export default app;
