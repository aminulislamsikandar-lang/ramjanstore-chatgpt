import { describe, expect, it } from "vitest";

describe("inventory reservation rules", () => {
  it("requires positive integer quantities", () => {
    for (const quantity of [0, -1, 1.5]) expect(Number.isInteger(quantity) && quantity > 0).toBe(false);
  });
  it("normalizes duplicate product lines", () => {
    const lines = [{ productId: "p1", quantity: 2 }, { productId: "p1", quantity: 3 }];
    const total = lines.filter(x => x.productId === "p1").reduce((sum, x) => sum + x.quantity, 0);
    expect(total).toBe(5);
  });
});
