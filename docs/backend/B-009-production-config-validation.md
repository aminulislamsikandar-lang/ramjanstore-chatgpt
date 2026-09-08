# B-009 — Production Configuration Validation

## Implemented

Production configuration is now validated before the HTTP server starts.

Rules enforced:

- `CLIENT_URL` cannot point to localhost or `127.0.0.1` in production.
- `ADMIN_URL` cannot point to localhost or `127.0.0.1` in production.
- `TRUST_PROXY=true` is required in production so deployments behind a reverse proxy do not silently run with incorrect proxy/security assumptions.
- Every URL in `CLIENT_URLS` must be a valid URL and cannot target localhost/127.0.0.1.
- Development and test environments keep their local defaults.

The existing Zod environment schema remains responsible for required variables, types and ranges. fileciteturn179file0L2-L2

## Startup behavior

`server.ts` invokes the production validator immediately after loading the validated environment and before binding the HTTP listener. This means a misconfigured production instance fails closed instead of accepting traffic with an unsafe deployment configuration. fileciteturn185file0L2-L2

## Tests

Added tests for valid production configuration, localhost rejection, proxy enforcement, `CLIENT_URLS` validation and development behavior.

## Task disposition

**B-009 complete.**
