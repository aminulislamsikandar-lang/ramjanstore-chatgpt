import { randomUUID } from "node:crypto";
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

const SENSITIVE_KEY = /password|token|secret|authorization|cookie|private.?key|api.?key|credential/i;

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 500) : value]),
  );
}

export async function writeAuditLog(event: AuditEvent): Promise<void> {
  const now = Timestamp.now();
  await db.collection("audit_logs").doc(randomUUID()).create({
    actorId: event.actorId,
    actorRole: event.actorRole,
    action: event.action.slice(0, 200),
    resource: event.resource.slice(0, 100),
    resourceId: event.resourceId?.slice(0, 200),
    method: event.method,
    path: event.path.slice(0, 500),
    statusCode: event.statusCode,
    ip: event.ip,
    userAgent: event.userAgent?.slice(0, 500),
    metadata: sanitizeMetadata(event.metadata),
    createdAt: now,
  });
}

export async function listAuditLogs(limit = 50) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const snapshot = await db.collection("audit_logs").orderBy("createdAt", "desc").limit(safeLimit).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
