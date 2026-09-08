# B-033 — Security Headers, CORS, CSRF & HTTP Attack-Surface Hardening

## Implemented

- Helmet is enabled globally with production HSTS and restrictive referrer policy.
- Additional HTTP hardening sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and no-store cache headers. fileciteturn307file0L2-L2
- CORS uses an explicit environment-configured origin allowlist and does not use wildcard origins with credentials. Allowed methods/headers are explicitly bounded. fileciteturn308file0L2-L2
- Added `csrfOriginGuard` for state-changing HTTP methods. Requests carrying an Origin header must match the configured trusted frontend/admin origins; safe methods are excluded.
- JSON and URL-encoded request bodies are capped at 1 MB and JSON parsing remains strict. fileciteturn308file0L2-L2
- `x-powered-by` is disabled.
- Proxy trust is explicit and controlled by `TRUST_PROXY`. fileciteturn308file0L2-L2

## CSRF boundary

The backend uses Firebase bearer authentication rather than cookie-based authentication. Therefore browser cookie CSRF is not the primary authentication path. The Origin guard is defense-in-depth for state-changing requests and protects browser clients that send an Origin header. It intentionally permits requests without Origin so non-browser/server-to-server API clients are not broken.

## Production review

Before production, verify the environment origin allowlist contains only the real HTTPS storefront/admin origins, `TRUST_PROXY` matches the actual proxy topology, and HSTS is enabled only when HTTPS is guaranteed. If cookie authentication is introduced later, add a dedicated CSRF token mechanism rather than relying only on the Origin guard.

**B-033 complete.**
