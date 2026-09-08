import { describe, expect, it } from "vitest";

const SENSITIVE_KEY = /password|token|secret|authorization|cookie|private.?key|api.?key|credential/i;

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !SENSITIVE_KEY.test(key)).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 500) : value]));
}

describe("audit metadata policy", () => {
  it("removes sensitive fields", () => {
    const result = sanitizeMetadata({ action: "update", password: "secret", accessToken: "token", safe: "value" });
    expect(result).toEqual({ action: "update", safe: "value" });
  });

  it("bounds string metadata", () => {
    const result = sanitizeMetadata({ value: "x".repeat(1000) });
    expect((result.value as string).length).toBe(500);
  });
});
