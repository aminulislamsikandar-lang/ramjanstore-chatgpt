# B-006 — Standard API Response Format

## Contract

### Success

All successful JSON API responses should use:

```json
{
  "success": true,
  "data": {}
}
```

HTTP status remains authoritative (200/201/204 where appropriate).

### Error

All JSON API errors should use:

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found.",
    "details": {},
    "requestId": "..."
  }
}
```

`details` and `requestId` are optional. Internal errors must not expose stack traces or sensitive implementation details.

## Implementation

`backend/src/utils/apiResponse.ts` now provides typed `success()` and `failure()` helpers. The global error handler already emits the same failure envelope and includes the request ID when available.

Order list/detail endpoints were migrated as the first concrete route consumers; the previous order-detail `{ message }` error is now a typed `ORDER_NOT_FOUND` error.

## Follow-up

Existing controllers/routes still contain some inline response construction. They should be migrated incrementally in B-006 follow-up work rather than changing every endpoint in one risky commit. API documentation/tests should assert the envelope for every route group.

## Task disposition

**B-006 foundation complete.** Standard response helpers are now available and the order endpoints demonstrate the canonical contract.
