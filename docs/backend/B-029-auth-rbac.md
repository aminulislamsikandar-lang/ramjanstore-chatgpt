# B-029 — Authentication, RBAC & Admin Endpoint Protection

## Implemented

- Firebase ID-token authentication now uses revocation checking (`verifyIdToken(token, true)`), so revoked sessions are rejected.
- Authorization roles are restricted to the explicit `owner` and `staff` admin roles; unknown/missing claims never receive admin access.
- Added centralized `hasRole()` and `requireRole()` helpers for consistent RBAC enforcement.
- Existing admin routes continue to require authentication and admin role; privileged mutations also require MFA.
- Admin product mutations and upload-signature endpoints require MFA, while admin order status mutation also requires MFA.
- Added RBAC unit tests proving staff cannot satisfy owner-only authorization.

## Security boundary

The backend trusts only Firebase Admin SDK-verified ID-token claims for the request identity and role. Client-supplied role fields are not an authorization source. Firestore/admin service credentials stay server-side.

## Endpoint policy

- Public catalog/read endpoints may remain unauthenticated where intended.
- Admin read endpoints require `authenticate + requireAdmin`.
- Admin mutations require `authenticate + requireAdmin + requireMfa` unless explicitly documented as a non-sensitive operation.
- Owner-only operations should use `authenticate + requireOwner` (or `requireRole("owner")`).

**B-029 complete.**
