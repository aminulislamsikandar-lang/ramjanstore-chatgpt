# B-035 — Firestore Security Rules & Client Data Boundary

## Implemented

- Confirmed Firebase is configured to deploy `firestore/firestore.rules`. fileciteturn319file0L1-L5
- Firestore rules use default-deny for all unmatched documents. fileciteturn320file0L2-L2
- Client writes remain disabled for application collections; mutations stay server-controlled.
- Customer-readable collections are restricted by authenticated UID ownership.
- Orders and return requests additionally permit authorized staff/owner reads where operational access is required.
- Privileged operational collections now explicitly deny client access: `coupons`, `delivery_zones`, `audit_logs`, `inventory_reservations`, and `background_jobs`.
- Message access remains constrained by sender/thread ownership or admin role.

## Server/client boundary

The backend uses Firebase Admin/server-side access for privileged mutations. Firestore client rules therefore act as a second security boundary rather than the primary business-logic authorization layer. The server must continue enforcing authentication, RBAC, ownership, validation, and transactional invariants.

## Important deployment check

Rules should be deployed with Firebase CLI as part of the release process. A rules change is not effective in production until the corresponding Firebase project has received the deployment.

**B-035 complete.**
