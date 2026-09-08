# B-011 — API Route-Level Rate Limiting & Abuse Protection

## Implemented

The backend already had a global 300 requests / 15 minute limiter and a 30 requests / 15 minute authentication limiter. Route-specific controls have now been added for higher-risk operations.

### Limits

| Limiter | Window | Limit | Applied to |
|---|---:|---:|---|
| Global API | 15 min | 300 | All API routes |
| Auth | 15 min | 30 | Profile sync |
| Write | 5 min | 60 | Address, order cancellation, coupon/zone mutations |
| Checkout | 10 min | 20 | Checkout processing |
| Upload signature | 10 min | 20 | Product/banner upload signatures |

All limiters emit stable machine-readable error codes and standard rate-limit headers.

## Rationale

Expensive or high-impact endpoints should not share the same budget as ordinary reads. Checkout, upload-signature generation and mutation endpoints now have dedicated budgets while the global limiter remains a safety net.

## Remaining production consideration

The current `express-rate-limit` memory store is appropriate for a single instance but is not a distributed counter. Before horizontally scaling the API, move rate-limit state to a shared store (for example Redis/Valkey) or use an equivalent managed edge/API gateway limiter.

**B-011 complete.**
