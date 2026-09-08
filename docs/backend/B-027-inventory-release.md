# B-027 — Reservation Release, Expiry & Overselling Prevention

## Implemented

- Inventory reservations now have an explicit lifecycle: `ACTIVE`, `RELEASED`, `COMMITTED`.
- New reservations receive a bounded TTL (default 15 minutes, maximum 120 minutes).
- Cancellation/manual release decrements `reservedStock` and marks the reservation `RELEASED` in one transaction.
- Expired reservations can be released transactionally with `releaseExpiredReservation()` and are tagged with `releaseReason: EXPIRED`.
- Commit checks the reservation expiry before decrementing physical `stock` and `reservedStock` atomically.
- A reservation can only be released/committed once because only `ACTIVE` reservations are actionable.
- Reservation creation refuses to reuse finalized reservations, preventing a completed order's reservation from being silently recreated.
- Added tests for quantity validity, duplicate-line normalization and zero-availability protection.

## Overselling invariant

At reservation time, `stock - reservedStock >= requestedQuantity` must hold inside the transaction. At commit time, both `stock` and `reservedStock` must cover the reservation. This keeps committed stock from becoming negative and prevents concurrent checkouts from reserving the same available units.

## Expiry processing

The service exposes the expiry operation; a scheduled worker/Cloud Scheduler should periodically call it for ACTIVE reservations whose `expiresAt` is in the past. The expiry worker must be retry-safe because finalized reservations are no-ops.

**B-027 complete.**
