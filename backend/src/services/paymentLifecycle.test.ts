import { describe, expect, it } from "vitest";
import { canTransitionPayment } from "./paymentLifecycle.js";

describe("payment lifecycle",()=>{
 it("allows forward transitions",()=>{expect(canTransitionPayment("PENDING","PAID")).toBe(true);expect(canTransitionPayment("AUTHORIZED","PAID")).toBe(true);});
 it("restricts refunds",()=>{expect(canTransitionPayment("PAID","REFUNDED")).toBe(true);expect(canTransitionPayment("PENDING","REFUNDED")).toBe(false);});
 it("blocks terminal changes",()=>{expect(canTransitionPayment("FAILED","PAID")).toBe(false);expect(canTransitionPayment("REFUNDED","PAID")).toBe(false);});
});
