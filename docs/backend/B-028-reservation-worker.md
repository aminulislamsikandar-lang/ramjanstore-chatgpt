# B-028 — Background Reservation Cleanup Worker

## Implemented

- Added a stable `reservation-cleanup` background job identity.
- Added transactional job enqueueing so duplicate scheduler triggers do not create concurrent pending jobs.
- Added transactional job claiming to prevent two workers from claiming the same pending job.
- Added a maximum of five attempts per job.
- Added per-reservation failure isolation so one bad reservation does not prevent other reservations from being processed.
- Reuses the transaction-safe `releaseExpiredReservation()` operation from B-027, making retries safe after partial worker failures.

## Scheduler integration

A deployment environment can invoke `enqueueReservationCleanup()` periodically (for example, every 5–15 minutes), then a worker can claim and process the job. The repository does not hard-wire a paid scheduler or provider-specific runtime.

## Operational recovery

A job that reaches the retry limit remains `FAILED` for operator visibility. Because reservation release is state-guarded and transactional, rerunning finalized reservations is safe. Stale `PROCESSING` jobs should be requeued by a future watchdog after a bounded lock timeout.

**B-028 complete.**
