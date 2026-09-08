# B-007 — Standard Error Codes & Error Handling

## Implemented

- Added `ApiError` as the canonical operational HTTP error type.
- Added helpers for 400, 401, 403, 404, 409 and 429 responses.
- Standard errors carry a stable machine-readable `code`, HTTP `statusCode`, safe `message`, and optional `details`.
- Existing global error middleware already maps Zod and Firestore failures into the canonical `{ success:false, error:{ code, message, ... } }` envelope.
- Added unit tests for the error type and HTTP helpers.

## Rules

1. Domain/business failures should throw `ApiError` rather than returning ad-hoc error JSON from services.
2. Controllers should use `failure()` when an error must be returned directly, or throw an `ApiError` and let the global middleware map it.
3. Machine-readable error codes must be stable and uppercase snake case.
4. Client messages must be safe; internal stack traces, Firestore internals, credentials and provider secrets must never be returned.
5. `requestId` is included by the response helper/error middleware when available.
6. Unknown errors remain `INTERNAL_SERVER_ERROR` with a generic public message and server-side logging.

## Follow-up

Existing inline controller errors should be migrated incrementally to `ApiError`/`failure()` and the error-code registry should grow by domain. This avoids a large behavior-changing rewrite.

**B-007 foundation complete.**
