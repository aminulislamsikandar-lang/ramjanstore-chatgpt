import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebase/firestore.js";

export type ReservationLine = { productId: string; quantity: number };

export async function reserveInventory(orderId: string, lines: ReservationLine[]) {
  if (!orderId.trim() || orderId.length > 128) throw new Error("Invalid order ID");
  if (!lines.length) throw new Error("At least one inventory line is required");
  const normalized = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId?.trim() || line.productId.length > 128 || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10000) throw new Error("Invalid inventory line");
    normalized.set(line.productId, (normalized.get(line.productId) ?? 0) + line.quantity);
  }
  await db.runTransaction(async tx => {
    for (const [productId, quantity] of normalized) {
      const ref = db.collection("products").doc(productId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error(`Product not found: ${productId}`);
      const stock = Number(snap.data()?.stock ?? 0);
      const reserved = Number(snap.data()?.reservedStock ?? 0);
      if (!Number.isInteger(stock) || !Number.isInteger(reserved) || stock < 0 || reserved < 0 || stock - reserved < quantity) throw new Error(`Insufficient inventory: ${productId}`);
      tx.update(ref, { reservedStock: FieldValue.increment(quantity), updatedAt: FieldValue.serverTimestamp() });
    }
    const reservationRef = db.collection("inventory_reservations").doc(orderId);
    tx.set(reservationRef, { orderId, lines: [...normalized].map(([productId, quantity]) => ({ productId, quantity })), status: "ACTIVE", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
}
