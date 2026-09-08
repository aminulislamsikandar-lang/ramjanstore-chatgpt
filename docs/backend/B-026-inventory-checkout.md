# B-026 — Inventory Reservation, Stock Race Protection & Checkout Atomicity

## Implemented

- Added transactional inventory reservation service.
- Product stock and reserved stock are read inside a Firestore transaction, so concurrent checkouts are retried by Firestore instead of performing unsafe read-modify-write operations.
- Available inventory is calculated as `stock - reservedStock` and reservation is rejected when insufficient.
- Duplicate product lines are normalized before reservation.
- Reservation records are keyed by order ID, making the reservation identity stable across checkout retries.
- Reservation quantities and identifiers are bounded and validated.
- Added unit tests for core inventory invariants.

## Checkout rule

The checkout flow should create the order and reserve inventory in the same transaction whenever both operations share a Firestore consistency boundary. External payment-provider calls must happen after the local transaction commits and must use provider idempotency keys.

## Release / cancellation

An order cancellation or payment timeout must release its active reservation exactly once. A future release handler should use a transaction to move the reservation to a terminal state and decrement each product's `reservedStock`; it must never decrement below zero.

**B-026 complete.**
