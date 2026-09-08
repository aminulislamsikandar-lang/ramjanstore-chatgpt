# B-017 — HTTP Security, CORS & Production Hardening

## Implemented

- Helmet enabled with production HSTS (1 year, subdomains, preload).
- `X-Powered-By` disabled.
- Explicit CORS allowlist from `CLIENT_URLS` or `CLIENT_URL,ADMIN_URL`.
- Credentials enabled only for allowlisted origins.
- Explicit HTTP methods and allowed request headers.
- CORS preflight cache limited to 24 hours.
- JSON and URL-encoded request bodies limited to 1 MB.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: no-referrer`.
- `Permissions-Policy` disables camera, microphone, geolocation and payment browser features for the API.
- API responses are marked `no-store` to avoid caching sensitive authenticated responses.
- Existing global rate limiting remains enabled.

## CSRF decision

The API authenticates using bearer authorization rather than browser ambient cookies for API authorization. Therefore a synchronizer-token CSRF layer is not added to bearer-authenticated endpoints. If browser session cookies are introduced for authenticated API calls, CSRF protection must be added before enabling those cookies.

## CSP decision

This is a JSON API, not the application's HTML document server. Helmet's CSP is disabled here deliberately to avoid applying an API response policy intended for HTML. CSP should be configured on the frontend/static-host layer where HTML is served.

## Deployment requirement

`CLIENT_URLS` must contain exact origins (scheme + host + optional port), comma-separated. Do not use `*` when credentials are enabled.

**B-017 complete.**
