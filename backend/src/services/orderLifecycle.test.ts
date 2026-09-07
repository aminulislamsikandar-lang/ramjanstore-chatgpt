import { describe, expect, it } from "vitest";
import { isOrderStatus, isTerminalOrderStatus, isValidNextOrderStatus, ORDER_FLOW } from "./orderLifecycle.js";

describe("order lifecycle", () => {
  it("defines the PRD delivery flow", () => {
    expect(ORDER_FLOW).toEqual([
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ]);
  });

  it("allows only the next sequential status", () => {
    expect(isValidNextOrderStatus("NEW", "CONFIRMED")).toBe(true);
    expect(isValidNextOrderStatus("CONFIRMED", "PREPARING")).toBe(true);
    expect(isValidNextOrderStatus("NEW", "PREPARING")).toBe(false);
    expect(isValidNextOrderStatus("CONFIRMED", "DELIVERED")).toBe(false);
    expect(isValidNextOrderStatus("DELIVERED", "NEW")).toBe(false);
  });

  it("rejects unknown statuses", () => {
    expect(isOrderStatus("UNKNOWN")).toBe(false);
    expect(isValidNextOrderStatus("UNKNOWN", "CONFIRMED")).toBe(false);
    expect(isValidNextOrderStatus("NEW", "UNKNOWN")).toBe(false);
  });

  it("recognizes terminal states", () => {
    expect(isTerminalOrderStatus("DELIVERED")).toBe(true);
    expect(isTerminalOrderStatus("CANCELLED")).toBe(true);
    expect(isTerminalOrderStatus("REFUNDED")).toBe(true);
    expect(isTerminalOrderStatus("RETURNED")).toBe(true);
    expect(isTerminalOrderStatus("PREPARING")).toBe(false);
  });
});
