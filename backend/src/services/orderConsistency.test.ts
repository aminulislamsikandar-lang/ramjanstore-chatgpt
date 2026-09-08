import { describe, expect, it } from "vitest";
import { assertPaymentTransition, canTransitionPayment } from "./orderConsistency.js";

describe("payment state transitions", () => {
  it("allows forward payment transitions", () => {
    expect(canTransitionPayment("PENDING", "PAID")).toBe(true);
    expect(canTransitionPayment("AUTHORIZED", "PAID")).toBe(true);
    expect(canTransitionPayment("PAID", "REFUNDED")).toBe(true);
  });

  it("blocks invalid rollback transitions", () => {
    expect(canTransitionPayment("PAID", "PENDING")).toBe(false);
    expect(() => assertPaymentTransition("REFUNDED", "PAID")).toThrow("Invalid payment transition");
  });
});
