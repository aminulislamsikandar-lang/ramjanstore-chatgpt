# B-031 — Input Validation & API Payload Abuse Protection

## Implemented

- Strengthened the existing centralized `validateBody` middleware with recursive payload abuse checks.
- Rejects excessively deep payload nesting.
- Rejects strings over 10,000 characters, arrays over 1,000 items, objects over 100 keys, and keys over 200 characters.
- Zod schemas remain strict for IDs and pagination, preventing unknown fields from silently entering validated query/parameter objects.
- Validation failures return a stable `VALIDATION_ERROR` response for body payloads; abuse-limit failures return `PAYLOAD_REJECTED` with HTTP 413.
- Existing query and path validation helpers are preserved.

## API rules

Every mutating endpoint should validate its body with a route-specific Zod schema before controller execution. Query and path parameters should use `validateQuery` / `validateParams` with strict schemas. Do not trust client-provided prices, totals, ownership IDs, roles, stock values, or payment states.

Payload limits complement, rather than replace, Express request-size limits and rate limiting. Keep the transport-level body limit enabled in the application bootstrap.

**B-031 complete.**
