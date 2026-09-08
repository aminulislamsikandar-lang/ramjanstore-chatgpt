import { describe, expect, it } from "vitest";
import { paginationQuerySchema, idParamSchema } from "./validate.js";

describe("paginationQuerySchema", () => {
  it("applies a safe default", () => expect(paginationQuerySchema.parse({}).limit).toBe(20));
  it("coerces and accepts bounded values", () => expect(paginationQuerySchema.parse({ limit: "100", cursor: "abc" })).toEqual({ limit: 100, cursor: "abc" }));
  it("rejects excessive limits", () => expect(() => paginationQuerySchema.parse({ limit: "101" })).toThrow());
  it("rejects unknown fields", () => expect(() => paginationQuerySchema.parse({ unexpected: "x" })).toThrow());
});

describe("idParamSchema", () => {
  it("rejects empty IDs", () => expect(() => idParamSchema.parse({ id: "   " })).toThrow());
  it("rejects unknown fields", () => expect(() => idParamSchema.parse({ id: "abc", extra: "x" })).toThrow());
});
