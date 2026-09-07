import "dotenv/config";
import http from "node:http";
import { app } from "./app.js";

const rawPort = process.env.PORT ?? "5000";
const port = Number(rawPort);
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${rawPort}`);
}

const server = http.createServer(app);
let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  console.info(`[server] ${signal} received; shutting down gracefully...`);

  server.close((error) => {
    if (error) {
      console.error("[server] graceful shutdown failed", error);
      process.exitCode = 1;
      return;
    }

    console.info("[server] HTTP server closed.");
    process.exitCode = 0;
  });

  setTimeout(() => {
    console.error("[server] forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error: Error) => {
  console.error("[process] uncaught exception", error);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[process] unhandled rejection", reason);
  shutdown("unhandledRejection");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("[server] HTTP server error", error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.info("[server] RamjanStore API started", {
    environment: process.env.NODE_ENV ?? "development",
    host,
    port,
    health: `/api/v1/health`,
  });
});
