import { db, Timestamp } from "../firebase/firestore.js";

export interface AuditEvent {
  actorId: string;
  actorRole: "owner" | "staff";
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(event: AuditEvent): Promise<void> {
  await db.collection("audit_logs").add({
    ...event,
    createdAt: Timestamp.now(),
  });
}
