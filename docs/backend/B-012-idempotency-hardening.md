# B-012 — Idempotency System Audit & Hardening

## Findings

Checkout already used a Firestore idempotency document and a transaction-level recheck, which prevents duplicate order creation during concurrent retries. The main gap was that a previously used key could be replayed with a different checkout payload and there was no bounded retention metadata.

## Implemented

- Added a checkout idempotency middleware guard.
- Requires a valid `Idempotency-Key` header (16–100 safe characters).
- Binds a key to a deterministic SHA-256 fingerprint of the normalized checkout payload: address, coupon and line items.
- Reusing a key with a different payload returns `409 IDEMPOTENCY_KEY_REUSED`.
- Existing completed responses are replayed without creating another order.
- The transaction remains the final atomic guard against concurrent duplicate creation.
- New idempotency records carry a 24-hour `expiresAt` field for bounded retention/TTL cleanup.
- Idempotency-store failures fail closed with `503 IDEMPOTENCY_STORE_UNAVAILABLE` rather than risking an unprotected checkout.

## Important client contract

Clients must send a stable `Idempotency-Key` for every checkout attempt and reuse that exact key only when retrying the same checkout request. A new checkout attempt must use a new key.

## Follow-up

Configure a Firestore TTL policy on `checkout_idempotency.expiresAt` in production so expired records are automatically removed. The transaction should remain the source of truth even after the middleware replay check.

**B-012 foundation complete.**
