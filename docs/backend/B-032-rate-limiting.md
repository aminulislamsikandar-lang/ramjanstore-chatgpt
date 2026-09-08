# B-032 — Rate Limiting, Brute-Force Protection & API Abuse Controls

## Implemented

The backend already has centralized `express-rate-limit` controls. They are applied globally through `apiRateLimiter`, with additional limiters available for sensitive operations:

- General API: 300 requests / 15 minutes
- Authentication: 30 requests / 15 minutes
- Writes: 60 requests / 5 minutes
- Checkout: 20 attempts / 10 minutes
- Upload signatures: 20 requests / 10 minutes

The global limiter is mounted before the API router, so all `/api/v1` routes receive a baseline abuse-control layer. fileciteturn305file0L2-L2

Standard rate-limit headers are enabled and legacy headers are disabled. fileciteturn306file0L2-L2

## Important deployment rule

The current limiter uses the default in-process store. This is safe for a single backend instance, but a multi-instance deployment needs a shared store (such as Redis) or platform-level edge rate limiting to enforce a global limit consistently across instances.

`TRUST_PROXY` must only be enabled when the deployment is actually behind a trusted proxy; otherwise client-IP based limiting can be misconfigured.

## Abuse boundaries

Sensitive operations should use the narrowest applicable limiter in addition to authentication and authorization. Rate limiting is defense-in-depth and does not replace Firebase authentication, RBAC, ownership checks, validation, or idempotency.

**B-032 complete.**
