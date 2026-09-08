# B-015 — Background Jobs, Retries & Async Reliability

## Implemented

Added a durable Firestore-backed job foundation under `backend/src/jobs/`.

### Guarantees

- Typed job names and payload contracts.
- Durable job records in `background_jobs` instead of process-memory-only state.
- Idempotent enqueue with optional `dedupeKey`.
- Transactional job claiming.
- Lease timeout so a crashed worker does not permanently strand a `PROCESSING` job.
- Exponential retry backoff capped at five minutes.
- Configurable maximum attempts; default is five.
- Terminal `FAILED` state after retries are exhausted.
- Completion and failure timestamps plus bounded error information.
- Worker lifecycle with polling and graceful stop.

### Initial job types

- `SEND_ORDER_NOTIFICATION`
- `RECONCILE_PAYMENT`
- `CLEANUP_IDEMPOTENCY`

## Reliability model

Business transactions should create durable jobs after committing their primary state. Job handlers must be idempotent because a handler can succeed immediately before a worker crashes and retries. External side effects should therefore use their own provider/message idempotency keys.

## Production deployment note

This queue is intentionally implemented on Firestore to avoid introducing paid infrastructure. For larger traffic volumes, a managed queue or Redis/Valkey-backed worker can replace the storage adapter without changing the typed job contract.

Before enabling workers in production, register concrete handlers for the job types and provide a bounded job-discovery query. Do not start a worker with an unbounded collection scan.

**B-015 foundation complete.**
