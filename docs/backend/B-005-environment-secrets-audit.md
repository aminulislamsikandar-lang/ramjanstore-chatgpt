# B-005 — Environment Variables & Secrets Audit

## Result

The backend now has a single validated environment contract in `backend/src/config/env.ts`. Firebase, Cloudinary, the HTTP server, and Express app configuration use that validated contract instead of reading `process.env` independently.

## Environment contract

### Required secrets

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Runtime configuration

- `NODE_ENV`
- `HOST`
- `PORT`
- `CLIENT_URL`
- `ADMIN_URL`
- `CLIENT_URLS`
- `TRUST_PROXY`
- `DEFAULT_CURRENCY`
- `RETURN_WINDOW_DAYS`

The example environment file contains placeholders only and documents the escaped-newline format required for the Firebase private key.

## Security findings

- `.env` and `.env.*` are ignored by Git, while `.env.example` is explicitly allowed. No secret values were found in the inspected tracked environment/config files.
- Firebase private-key normalization is retained, but the credential is now sourced from the validated environment object.
- Cloudinary credentials are now sourced from the validated environment object.
- The server port/host and Express CORS/trust-proxy settings now use the same validated configuration.

## Gaps remaining

1. Production deployment secrets must be stored in the deployment provider's secret manager/environment settings, never committed to Git.
2. Secret rotation/revocation procedure should be documented before launch.
3. Environment-specific production validation should reject unsafe defaults such as localhost origins when `NODE_ENV=production`.
4. CI currently runs the storefront test command from the root; a dedicated backend test gate should be added so backend configuration tests execute in CI.

## Task disposition

**B-005 complete.** The immediate implementation gap—multiple modules independently consuming raw environment variables—has been fixed. Remaining production-policy items are explicit follow-up tasks.

## Next task

**B-006 — Standardize API response format.**
