# Deployment Checklist

## Backend

- Set `NODE_ENV=production`, `HOST=0.0.0.0`, and a platform-provided `PORT`.
- Configure Firebase Admin credentials through encrypted environment variables.
- Configure Cloudinary credentials through encrypted environment variables.
- Set exact `CLIENT_URL` and `ADMIN_URL` origins; do not use `*` with credentials.
- Set `TRUST_PROXY=true` only when the deployment platform is behind a trusted proxy.
- Run `npm run build:backend` and start `node backend/dist/server.js`.

## Firestore

Deploy `firebase.json`, `firestore/firestore.rules`, and `firestore/firestore.indexes.json` with the Firebase CLI after reviewing the target project.

## Frontends

Build storefront and admin separately. The admin origin should not be indexed by search engines and should be protected by Firebase authentication plus server-side role checks.

## Pre-production checks

- Verify CORS with both origins.
- Verify anonymous browsing and authenticated customer access.
- Verify customer cannot read another customer's order/address/message data.
- Verify customer cannot write operational collections directly.
- Verify owner/staff custom claims.
- Test Cloudinary signatures and folder restrictions.
- Test concurrent checkout stock deduction.
- Test expired/invalid coupons.
- Test cancellation cutoff and return window.
