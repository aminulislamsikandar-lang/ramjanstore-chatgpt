import { randomUUID } from "node:crypto";
import { db, Timestamp } from "../firebase/firestore.js";
import { JOB_DEFAULTS, type JobName, type JobPayloads } from "./jobTypes.js";

const jobs = () => db.collection("background_jobs");

export async function enqueueJob<N extends JobName>(name: N, payload: JobPayloads[N], options?: { maxAttempts?: number; delayMs?: number; dedupeKey?: string }) {
  const now = Date.now();
  const id = options?.dedupeKey ? `${name}_${options.dedupeKey}` : randomUUID();
  const ref = jobs().doc(id);
  const existing = await ref.get();
  if (existing.exists && ["PENDING", "PROCESSING", "COMPLETED"].includes(String(existing.data()?.status))) return ref.id;
  const timestamp = Timestamp.now();
  await ref.set({ id: ref.id, name, payload, status: "PENDING", attempts: 0, maxAttempts: options?.maxAttempts ?? JOB_DEFAULTS.maxAttempts, runAfter: new Date(now + (options?.delayMs ?? 0)).toISOString(), createdAt: timestamp, updatedAt: timestamp });
  return ref.id;
}

export function retryDelay(attempt: number) {
  return Math.min(JOB_DEFAULTS.backoffBaseMs * 2 ** Math.max(0, attempt - 1), JOB_DEFAULTS.backoffMaxMs);
}

export async function claimJob(jobId: string) {
  const ref = jobs().doc(jobId);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const d = snap.data()!;
    const now = Date.now();
    const lockedAt = d.lockedAt ? Date.parse(String(d.lockedAt)) : 0;
    const expired = lockedAt > 0 && now - lockedAt >= JOB_DEFAULTS.leaseMs;
    if (d.status === "COMPLETED" || d.status === "FAILED" || (d.status === "PROCESSING" && !expired) || (d.status === "PENDING" && Date.parse(String(d.runAfter)) > now)) return null;
    const attempts = Number(d.attempts ?? 0) + 1;
    tx.update(ref, { status: "PROCESSING", attempts, lockedAt: new Date(now).toISOString(), updatedAt: Timestamp.now() });
    return { id: ref.id, ...d, attempts };
  });
}

export async function completeJob(jobId: string) {
  await jobs().doc(jobId).update({ status: "COMPLETED", completedAt: new Date().toISOString(), lockedAt: null, updatedAt: Timestamp.now() });
}

export async function failJob(jobId: string, attempts: number, maxAttempts: number, error: unknown) {
  const terminal = attempts >= maxAttempts;
  await jobs().doc(jobId).update({ status: terminal ? "FAILED" : "PENDING", runAfter: new Date(Date.now() + retryDelay(attempts)).toISOString(), lockedAt: null, failedAt: terminal ? new Date().toISOString() : null, lastError: error instanceof Error ? error.message.slice(0, 1000) : "Unknown job error", updatedAt: Timestamp.now() });
}
