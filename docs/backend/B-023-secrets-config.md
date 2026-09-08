# B-023 — Secrets & Configuration Management

## Implemented

- Added `backend/.env.example` containing placeholders only; it contains no real credentials.
- Centralized environment validation remains in `backend/src/config/env.ts`.
- Configuration is parsed before the application starts, so missing/invalid required secrets fail fast.
- Validation errors now identify configuration keys and reasons without printing secret values.
- Firebase and Cloudinary credentials remain environment-injected and are not embedded in source code.

## Required production secrets

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` must be supplied by the deployment environment/secret manager.

## Rules

- Never commit `.env` files or real service-account keys.
- Never log secret values.
- Rotate credentials if they are accidentally exposed.
- Keep separate credentials/projects for development, test and production.
- Treat `CLIENT_URLS` and other configuration as deployment configuration, not hardcoded production values.

**B-023 complete.**
