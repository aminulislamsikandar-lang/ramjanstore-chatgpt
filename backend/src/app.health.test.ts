import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "./app.js";

vi.mock("./firebase/firestore.js", () => ({
  db: { collection: () => ({ doc: () => ({ get: vi.fn().mockResolvedValue({ exists: false }) }) }) },
}));

describe("health endpoints", () => {
  it("returns liveness without checking dependencies", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: "healthy" } });
  });

  it("returns readiness when Firestore responds", async () => {
    const response = await request(app).get("/api/v1/ready");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: "ready", checks: { firestore: "ok" } } });
  });
});
