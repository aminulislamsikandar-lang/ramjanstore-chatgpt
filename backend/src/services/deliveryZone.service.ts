import { db, Timestamp } from "../firebase/firestore.js";

export interface DeliveryZone { id: string; name: string; postalCodes: string[]; baseCharge: number; minimumOrderValue: number; freeDeliveryThreshold?: number; isActive: boolean; createdAt?: Timestamp; updatedAt?: Timestamp; }

const ref = () => db.collection("delivery_zones");
export async function listDeliveryZones(): Promise<DeliveryZone[]> { const s = await ref().orderBy("name").get(); return s.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryZone)); }
export async function getDeliveryZoneByPostalCode(postalCode: string): Promise<DeliveryZone | null> { const normalized = postalCode.trim(); const s = await ref().where("postalCodes", "array-contains", normalized).where("isActive", "==", true).limit(1).get(); return s.empty ? null : ({ id: s.docs[0].id, ...s.docs[0].data() } as DeliveryZone); }
export async function createDeliveryZone(input: Omit<DeliveryZone,"id"|"createdAt"|"updatedAt">): Promise<DeliveryZone> { const now = Timestamp.now(); const doc = await ref().add({ ...input, createdAt: now, updatedAt: now }); return { id: doc.id, ...input, createdAt: now, updatedAt: now }; }
export async function updateDeliveryZone(id: string, input: Partial<Omit<DeliveryZone,"id"|"createdAt"|"updatedAt">>): Promise<DeliveryZone> { const now = Timestamp.now(); await ref().doc(id).update({ ...input, updatedAt: now }); const d = await ref().doc(id).get(); if (!d.exists) throw new Error("Delivery zone not found"); return { id: d.id, ...d.data() } as DeliveryZone; }
export async function deleteDeliveryZone(id: string): Promise<void> { await ref().doc(id).update({ isActive: false, updatedAt: Timestamp.now() }); }
