import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebase/firestore.js";

export async function atomicIncrement(refPath: string, field: string, delta: number) {
  if (!Number.isFinite(delta) || !Number.isInteger(delta)) throw new Error("delta must be an integer");
  await db.doc(refPath).update({ [field]: FieldValue.increment(delta), updatedAt: FieldValue.serverTimestamp() });
}

export async function runIntegrityTransaction<T>(work: Parameters<typeof db.runTransaction>[0]): Promise<T> {
  return db.runTransaction(work) as Promise<T>;
}
