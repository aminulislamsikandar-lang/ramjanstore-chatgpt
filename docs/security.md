# Security Baseline

1. Never commit `.env` or Firebase service-account credentials.
2. Verify Firebase ID tokens server-side for every protected API.
3. Use custom claims for `owner`/`staff`; never authorize admin access by email string alone.
4. Keep all client writes disabled for orders, coupons, audit logs and other operational collections.
5. Recalculate checkout totals on the server from Firestore data.
6. Deduct inventory and create the order in one Firestore transaction.
7. Generate Cloudinary signatures server-side and expose only approved upload folders.
8. Apply request size limits, Helmet, CORS allowlisting, rate limiting and request IDs.
9. Do not log tokens, passwords, Firebase private keys, payment secrets or OTPs.
10. Use HTTPS in every deployed environment and HTTP-only secure cookies if/when admin session cookies are introduced.
11. Validate every request with Zod before business logic.
12. Add audit records for privileged mutations, refunds, moderation and role changes.
