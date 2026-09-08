import { randomUUID } from "node:crypto";
import { db, Timestamp } from "../firebase/firestore.js";

export type AuditOutcome = "SUCCESS" | "FAILURE";
export interface AuditEventInput { actorId:string; actorRole?:string; action:string; resourceType:string; resourceId?:string; outcome:AuditOutcome; requestId?:string; ip?:string; userAgent?:string; metadata?:Record<string,unknown>; }

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  const sensitive=/password|token|secret|authorization|cookie|private.?key|api.?key/i;
  return Object.fromEntries(Object.entries(metadata).filter(([key])=>!sensitive.test(key)).map(([key,value])=>[key,typeof value==="string"?value.slice(0,500):value]));
}

export async function writeAuditEvent(input:AuditEventInput){const now=Timestamp.now(),ref=db.collection("audit_logs").doc(randomUUID());await ref.create({...input,metadata:sanitizeMetadata(input.metadata),createdAt:now});return ref.id;}
export async function listAuditEvents(limit=50){const safeLimit=Math.min(Math.max(Math.trunc(limit),1),100);const snap=await db.collection("audit_logs").orderBy("createdAt","desc").limit(safeLimit).get();return snap.docs.map(doc=>({id:doc.id,...doc.data()}));}
