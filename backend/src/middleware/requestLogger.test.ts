import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { requestLogger } from "./requestLogger.js";

describe("requestLogger correlation IDs", () => {
  it("preserves a valid inbound request id", async () => {
    const app = express();
    app.use(requestLogger);
    app.get("/", (_req, res) => res.json({ requestId: res.locals.requestId }));

    const response = await request(app).get("/").set("X-Request-ID", "checkout-123");

    expect(response.headers["x-request-id"]).toBe("checkout-123");
    expect(response.body.requestId).toBe("checkout-123");
  });

  it("replaces malformed or oversized inbound ids", async () => {
    const app = express();
    app.use(requestLogger);
    app.get("/", (_req, res) => res.json({ requestId: res.locals.requestId }));

    const response = await request(app).get("/").set("X-Request-ID", "bad id");

    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
  });

  it("logs the same correlation id used by the response", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const app = express();
    app.use(requestLogger);
    app.get("/", (_req, res) => res.sendStatus(204));

    await request(app).get("/").set("X-Request-ID", "trace-456");

    expect(log).toHaveBeenCalledWith("HTTP request", expect.objectContaining({ requestId: "trace-456" }));
    log.mockRestore();
  });
});
