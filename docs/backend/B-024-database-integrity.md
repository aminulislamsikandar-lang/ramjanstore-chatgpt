# B-024 — Firestore Consistency, Indexes & Data Integrity

## Implemented

- Added composite indexes for audit log ordering and background-job status/runAt queries while preserving the existing commerce indexes.
- Added `atomicIncrement()` for integer counters using Firestore atomic increments and server timestamps.
- Added a transaction helper so multi-document invariants can use Firestore transactions instead of independent writes.
- Added deployment-safe index configuration for the production preflight.

## Integrity rules

Inventory, payment state transitions, order totals and other coupled state must be updated atomically whenever correctness depends on multiple reads/writes. Counters must use atomic increments rather than read-modify-write logic.

Idempotency keys remain the boundary for retried external operations; transactions do not make third-party side effects atomic. External payment/notification calls must be made outside a transaction and protected by their own idempotency mechanism.

## Index deployment

`firestore.indexes.json` is the source of truth. Deploy indexes before enabling application code that requires a new composite query. Retain additive indexes during application rollback.

**B-024 complete.**
