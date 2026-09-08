# B-010 — Health / Readiness Checks

## Implemented

The backend now exposes two distinct operational endpoints:

- `GET /api/v1/health` — liveness check. Returns 200 when the Node/Express process is serving requests and does not depend on Firestore.
- `GET /api/v1/ready` — readiness check. Performs a lightweight Firestore read and returns 200 only when the database dependency responds.

Readiness failures return HTTP `503` with the standard API error envelope and code `SERVICE_NOT_READY`.

Both endpoints use the standard `success()` / `failure()` response contract and therefore include request correlation IDs through the existing middleware.

## Why this split matters

Container/orchestrator liveness probes should not restart a healthy process just because Firestore is temporarily unavailable. Readiness can instead remove the instance from traffic until its dependency is available again.

## Tests

Added coverage for both endpoints, including the Firestore readiness path.

**B-010 complete.**
