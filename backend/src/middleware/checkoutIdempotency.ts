import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { db } from "../firebase/firestore.js";
import { failure } from "../utils/apiResponse.js";

const KEY_RE = /^[A-Za-z0-9_-]{16,100}$/;

function fingerprint(body: Record<string, unknown>): string {
  const items = Array.isArray(body.items) ? body.items.map((item) => {
    const value = item as Record<string, unknown>;
    return { productId: String(value.productId ?? ""), variantId: value.variantId ? String(value.variantId) : null, quantity: Number(value.quantity) };
  }).sort((a, b) => `${a.productId}:${a.variantId ?? ""}`.localeCompare(`${b.productId}:${b.variantId ?? ""}`)) : [];
  return createHash("sha256").update(JSON.stringify({
    addressId: String(body.addressId ?? ""),
    couponCode: body.couponCode ? String(body.couponCode).trim().toUpperCase() : null,
    items,
  })).digest("hex");
}

/**
 * Validates replay safety before checkout business logic runs.
 * The checkout transaction remains the source of truth for atomic creation.
 */
export const checkoutIdempotency: RequestHandler = async (req, res, next) => {
  const key = String(req.header("Idempotency-Key") ?? "");
  if (!KEY_RE.test(key)) return void failure(res, 400, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key (16-100 characters) is required");

  try {
    const userId = (req as Request & { user?: { uid: string } }).user?.uid;
    if (!userId) return void failure(res, 401, "UNAUTHORIZED", "Authentication is required.");
    const ref = db.collection("checkout_idempotency").doc(`${userId}_${key}`);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      const data = snapshot.data()!;
      if (data.requestFingerprint && data.requestFingerprint !== fingerprint(req.body as Record<string, unknown>)) {
        return void failure(res, 409, "IDEMPOTENCY_KEY_REUSED", "This Idempotency-Key was already used with a different checkout request");
      }
      if (data.response) return void res.status(Number(data.httpStatus ?? 201)).json(data.response);
    }
    res.locals.idempotencyKey = key;
    res.locals.idempotencyFingerprint = fingerprint(req.body as Record<string, unknown>);
    next();
  } catch {
    return void failure(res, 503, "IDEMPOTENCY_STORE_UNAVAILABLE", "Checkout protection is temporarily unavailable.");
  }
};
