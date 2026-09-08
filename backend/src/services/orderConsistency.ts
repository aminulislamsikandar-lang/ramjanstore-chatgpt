export const PAYMENT_STATES = ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentState = typeof PAYMENT_STATES[number];

const transitions: Record<PaymentState, readonly PaymentState[]> = {
  PENDING: ["AUTHORIZED", "PAID", "FAILED"],
  AUTHORIZED: ["PAID", "FAILED", "REFUNDED"],
  PAID: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return from === to || transitions[from].includes(to);
}

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!canTransitionPayment(from, to)) throw new Error(`Invalid payment transition: ${from} -> ${to}`);
}

export function paymentSuccessState() { return { paymentStatus: "PAID" as const }; }
export function paymentFailureState() { return { paymentStatus: "FAILED" as const }; }
