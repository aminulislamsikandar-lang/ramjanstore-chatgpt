import { describe, expect, it } from "vitest";
import { validateProductionConfig } from "./productionConfig.js";

const base = {
  NODE_ENV: "production" as const,
  CLIENT_URL: "https://store.example.com",
  ADMIN_URL: "https://admin.example.com",
  TRUST_PROXY: "true" as const,
};

describe("validateProductionConfig", () => {
  it("accepts a production deployment configuration", () => {
    expect(() => validateProductionConfig(base)).not.toThrow();
  });

  it("rejects localhost client URLs", () => {
    expect(() => validateProductionConfig({ ...base, CLIENT_URL: "http://localhost:5173" })).toThrow(/CLIENT_URL/);
  });

  it("requires trusted proxy handling in production", () => {
    expect(() => validateProductionConfig({ ...base, TRUST_PROXY: "false" })).toThrow(/TRUST_PROXY/);
  });

  it("rejects localhost entries in CLIENT_URLS", () => {
    expect(() => validateProductionConfig({ ...base, CLIENT_URLS: "https://store.example.com,http://127.0.0.1:5173" })).toThrow(/CLIENT_URLS/);
  });

  it("does not impose production restrictions on development", () => {
    expect(() => validateProductionConfig({ ...base, NODE_ENV: "development", CLIENT_URL: "http://localhost:5173", TRUST_PROXY: "false" })).not.toThrow();
  });
});
