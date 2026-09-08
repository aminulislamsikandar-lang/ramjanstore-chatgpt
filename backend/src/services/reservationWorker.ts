import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase/firestore.js";
import { releaseExpiredReservation } from "./inventoryReservation.js";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
const MAX_ATTEMPTS = 5;

export async function enqueueReservationCleanup() {
  const ref = db.collection("background_jobs").doc("reservation-cleanup");
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const data = snap.data();
    if (data?.status === "PENDING" || data?.status === "PROCESSING") return;
    tx.set(ref, { type: "RESERVATION_CLEANUP", status: "PENDING", attempts: 0, runAt: Timestamp.now(), updatedAt: Timestamp.now() }, { merge: true });
  });
}

export async function claimReservationCleanupJob() {
  const ref = db.collection("background_jobs").doc("reservation-cleanup");
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    const data = snap.data()!;
    if (data.status !== "PENDING" || data.runAt.toMillis() > Date.now() || Number(data.attempts ?? 0) >= MAX_ATTEMPTS) return false;
    tx.update(ref, { status: "PROCESSING", attempts: Number(data.attempts ?? 0) + 1, lockedAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return true;
  });
}

export async function runReservationCleanup(reservationIds: string[]) {
  let failures = 0;
  for (const orderId of reservationIds) {
    try { await releaseExpiredReservation(orderId); } catch (error) { failures++; console.error(JSON.stringify({ event: "reservation_cleanup_failed", orderId, error: error instanceof Error ? error.message : "unknown" })); }
  }
  const ref = db.collection("background_jobs").doc("reservation-cleanup");
  await ref.update({ status: failures ? "FAILED" : "COMPLETED", lastErrorCount: failures, completedAt: Timestamp.now(), updatedAt: Timestamp.now() });
  return { processed: reservationIds.length, failures };
}
