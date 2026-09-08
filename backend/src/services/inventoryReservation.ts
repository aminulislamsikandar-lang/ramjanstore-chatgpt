import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase/firestore.js";

export type ReservationLine = { productId: string; quantity: number };
export type ReservationStatus = "ACTIVE" | "RELEASED" | "COMMITTED";

function normalizeLines(lines: ReservationLine[]) {
  if (!lines.length) throw new Error("At least one inventory line is required");
  const normalized = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId?.trim() || line.productId.length > 128 || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10000) throw new Error("Invalid inventory line");
    normalized.set(line.productId, (normalized.get(line.productId) ?? 0) + line.quantity);
  }
  return [...normalized].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function reserveInventory(orderId: string, lines: ReservationLine[], ttlMinutes = 15) {
  if (!orderId.trim() || orderId.length > 128) throw new Error("Invalid order ID");
  if (!Number.isInteger(ttlMinutes) || ttlMinutes < 1 || ttlMinutes > 120) throw new Error("Invalid reservation TTL");
  const normalized = normalizeLines(lines);
  const reservationRef = db.collection("inventory_reservations").doc(orderId);
  await db.runTransaction(async tx => {
    const existing = await tx.get(reservationRef);
    if (existing.exists) {
      if (existing.data()?.status === "ACTIVE") return;
      throw new Error("Reservation already finalized");
    }
    for (const { productId, quantity } of normalized) {
      const ref = db.collection("products").doc(productId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error(`Product not found: ${productId}`);
      const stock = Number(snap.data()?.stock ?? 0);
      const reserved = Number(snap.data()?.reservedStock ?? 0);
      if (!Number.isInteger(stock) || !Number.isInteger(reserved) || stock < 0 || reserved < 0 || stock - reserved < quantity) throw new Error(`Insufficient inventory: ${productId}`);
      tx.update(ref, { reservedStock: FieldValue.increment(quantity), updatedAt: FieldValue.serverTimestamp() });
    }
    tx.set(reservationRef, { orderId, lines: normalized, status: "ACTIVE", expiresAt: Timestamp.fromMillis(Date.now() + ttlMinutes * 60_000), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function releaseInventoryReservation(orderId: string) {
  const reservationRef = db.collection("inventory_reservations").doc(orderId);
  await db.runTransaction(async tx => {
    const reservation = await tx.get(reservationRef);
    if (!reservation.exists || reservation.data()?.status !== "ACTIVE") return;
    const lines = reservation.data()?.lines as ReservationLine[];
    for (const { productId, quantity } of lines) {
      const ref = db.collection("products").doc(productId);
      const product = await tx.get(ref);
      if (!product.exists) throw new Error(`Product not found: ${productId}`);
      const reserved = Number(product.data()?.reservedStock ?? 0);
      if (!Number.isInteger(reserved) || reserved < quantity) throw new Error(`Reservation integrity violation: ${productId}`);
      tx.update(ref, { reservedStock: FieldValue.increment(-quantity), updatedAt: FieldValue.serverTimestamp() });
    }
    tx.update(reservationRef, { status: "RELEASED", releasedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function releaseExpiredReservation(orderId: string, now = Date.now()) {
  const reservationRef = db.collection("inventory_reservations").doc(orderId);
  await db.runTransaction(async tx => {
    const reservation = await tx.get(reservationRef);
    if (!reservation.exists || reservation.data()?.status !== "ACTIVE") return;
    const expiresAt = reservation.data()?.expiresAt;
    if (!expiresAt || typeof expiresAt.toMillis !== "function" || expiresAt.toMillis() > now) return;
    const lines = reservation.data()?.lines as ReservationLine[];
    for (const { productId, quantity } of lines) {
      const ref = db.collection("products").doc(productId);
      const product = await tx.get(ref);
      if (!product.exists) throw new Error(`Product not found: ${productId}`);
      const reserved = Number(product.data()?.reservedStock ?? 0);
      if (!Number.isInteger(reserved) || reserved < quantity) throw new Error(`Reservation integrity violation: ${productId}`);
      tx.update(ref, { reservedStock: FieldValue.increment(-quantity), updatedAt: FieldValue.serverTimestamp() });
    }
    tx.update(reservationRef, { status: "RELEASED", releasedAt: FieldValue.serverTimestamp(), releaseReason: "EXPIRED", updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function commitInventoryReservation(orderId: string) {
  const reservationRef = db.collection("inventory_reservations").doc(orderId);
  await db.runTransaction(async tx => {
    const reservation = await tx.get(reservationRef);
    if (!reservation.exists || reservation.data()?.status !== "ACTIVE") return;
    const expiresAt = reservation.data()?.expiresAt;
    if (expiresAt && typeof expiresAt.toMillis === "function" && expiresAt.toMillis() <= Date.now()) throw new Error("Inventory reservation expired");
    const lines = reservation.data()?.lines as ReservationLine[];
    for (const { productId, quantity } of lines) {
      const ref = db.collection("products").doc(productId);
      const product = await tx.get(ref);
      if (!product.exists) throw new Error(`Product not found: ${productId}`);
      const stock = Number(product.data()?.stock ?? 0);
      const reserved = Number(product.data()?.reservedStock ?? 0);
      if (stock < quantity || reserved < quantity) throw new Error(`Reservation integrity violation: ${productId}`);
      tx.update(ref, { stock: FieldValue.increment(-quantity), reservedStock: FieldValue.increment(-quantity), updatedAt: FieldValue.serverTimestamp() });
    }
    tx.update(reservationRef, { status: "COMMITTED", committedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
}
