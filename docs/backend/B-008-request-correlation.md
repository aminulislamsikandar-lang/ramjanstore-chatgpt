# B-008 — Request ID / Correlation System

## Implemented

The backend now has a deterministic request-correlation contract:

- Every HTTP request receives an `X-Request-ID` response header.
- A valid inbound `X-Request-ID` is preserved for end-to-end tracing.
- Invalid or oversized inbound IDs are discarded and replaced with a cryptographically random UUID.
- The ID is stored in `res.locals.requestId` for controllers, response helpers and error handling.
- Request completion logs include the same correlation ID, method, path, status and duration.
- Automated tests cover valid IDs, malformed IDs and logger correlation.

## Accepted ID format

`^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`

Maximum length: 128 characters.

## Security rationale

Client-supplied IDs are useful for tracing but must not be allowed to inject arbitrary log/control characters. Invalid values are therefore replaced instead of echoed into logs or responses.

## Integration

`app.ts` already mounts `requestLogger` before API routes, so all API requests receive correlation handling before controller execution.

**B-008 complete.**
