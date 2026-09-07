import { describe, expect, it } from "vitest";
import { canReserveStock, isValidIdempotencyKey, reserveStock, restoreStock } from "./checkoutInvariants.js";

describe("checkout invariants", () => {
  it("rejects insufficient or invalid stock reservations", () => {
    expect(canReserveStock(5, 5)).toBe(true);
    expect(canReserveStock(4, 5)).toBe(false);
    expect(canReserveStock(-1, 1)).toBe(false);
    expect(canReserveStock(5, 0)).toBe(false);
  });

  it("reserves and restores exact quantities", () => {
    expect(reserveStock(10, 3)).toBe(7);
    expect(restoreStock(7, 3)).toBe(10);
  });

  it("never permits invalid stock operations", () => {
    expect(() => reserveStock(2, 3)).toThrow("INSUFFICIENT_STOCK");
    expect(() => restoreStock(-1, 1)).toThrow("INVALID_STOCK_OPERATION");
    expect(() => restoreStock(2, 0)).toThrow("INVALID_STOCK_OPERATION");
  });

  it("enforces checkout idempotency key format", () => {
    expect(isValidIdempotencyKey("1234567890abcdef")).toBe(true);
    expect(isValidIdempotencyKey("short")).toBe(false);
    expect(isValidIdempotencyKey("bad key with spaces")).toBe(false);
  });
});
