export type JobName = "SEND_ORDER_NOTIFICATION" | "RECONCILE_PAYMENT" | "CLEANUP_IDEMPOTENCY";

export interface JobPayloads {
  SEND_ORDER_NOTIFICATION: { orderId: string; event: "created" | "cancelled" | "status_changed" };
  RECONCILE_PAYMENT: { orderId: string; providerPaymentId?: string };
  CLEANUP_IDEMPOTENCY: { before: string };
}

export interface JobRecord<N extends JobName = JobName> {
  id: string;
  name: N;
  payload: JobPayloads[N];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  attempts: number;
  maxAttempts: number;
  runAfter: string;
  lockedAt?: string;
  completedAt?: string;
  failedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export const JOB_DEFAULTS = { maxAttempts: 5, backoffBaseMs: 1_000, backoffMaxMs: 5 * 60_000, leaseMs: 2 * 60_000 } as const;
