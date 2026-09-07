import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import uploadRoutes from "./routes/upload.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "ramjanstore-api" }));
app.use("/api/v1/uploads", uploadRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});
