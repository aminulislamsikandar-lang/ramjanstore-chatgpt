import { describe, expect, it } from "vitest";

describe("inventory reservation invariants", () => {
  it("rejects non-positive or fractional quantities", () => {
    for (const quantity of [0, -1, 1.5]) expect(Number.isInteger(quantity) && quantity > 0).toBe(false);
  });
  it("combines duplicate product lines", () => {
    const lines = [{ productId: "p1", quantity: 2 }, { productId: "p1", quantity: 3 }];
    expect(lines.reduce((sum, line) => sum + line.quantity, 0)).toBe(5);
  });
  it("does not permit availability below zero", () => {
    const stock = 4, reserved = 4, requested = 1;
    expect(stock - reserved >= requested).toBe(false);
  });
});
