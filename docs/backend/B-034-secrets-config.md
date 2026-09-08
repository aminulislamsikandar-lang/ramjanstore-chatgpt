# B-034 — Secrets, Configuration & Production Credential Safety

## Implemented

- Central environment schema validates required Firebase and Cloudinary credentials at startup.
- Secret values must be non-empty and may not contain CR/LF characters, preventing accidental multiline injection into configuration values.
- Production configuration now fails fast when storefront/admin origins point to localhost/127.0.0.1.
- `TRUST_PROXY=true` requires an explicitly recognized trusted deployment platform; invalid production configuration fails before serving traffic.
- Error reporting contains variable names and validation messages, never secret values.

The environment module already failed fast on invalid configuration using Zod; this task strengthens secret constraints while preserving that behavior. fileciteturn316file0L2-L2

## Credential safety rules

Secrets must be supplied through the deployment environment/secret manager and must never be committed to Git. Firebase private keys and Cloudinary API secrets are server-only values. Frontend bundles must receive only public configuration intended for browsers.

If a credential is ever exposed in Git history, logs, screenshots, CI output, or a client bundle, rotate/revoke it immediately; deleting the file alone is not sufficient.

## Production checklist

1. Set `NODE_ENV=production`.
2. Use real HTTPS storefront/admin origins.
3. Store Firebase/Cloudinary secrets in deployment secrets.
4. Verify `TRUST_PROXY` against the actual network topology.
5. Confirm no `.env` files or private keys are tracked by Git.
6. Rotate any credential that may have been exposed during development.

**B-034 complete.**
