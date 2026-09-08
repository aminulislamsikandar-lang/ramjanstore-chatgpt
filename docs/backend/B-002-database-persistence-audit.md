# B-002 — Database / Persistence Layer Audit

## Result

The backend uses Firebase Admin Firestore as its persistence layer. Firebase bootstrap is centralized in `backend/src/config/firebase.ts`, while `backend/src/firebase/firestore.ts` re-exports the Firestore client and timestamp helpers.

## Confirmed

- Primary database: Cloud Firestore.
- Firebase initialization fails fast when required Firebase Admin environment variables are missing.
- Product persistence is implemented in `backend/src/repositories/product.repository.ts`.
- User and address persistence currently live directly in `backend/src/services/user.service.ts`.
- Firestore transactions are already used for stock updates and default-address changes.
- No Prisma or Mongoose usage was found.

## Findings

### P1 — Data-access boundary is inconsistent

Products use a repository, while `user.service.ts` directly owns Firestore collection references and CRUD. This makes transaction and query policies harder to enforce consistently.

**Follow-up:** progressively introduce domain repositories for user, address, cart, order, payment, coupon, review, wishlist, delivery zone and audit data without changing public API behavior.

### P1 — Transaction coverage needs a domain-wide audit

Transactions exist for stock updates and default-address changes, but checkout/order/payment/inventory flows need explicit verification. Multi-document business operations must use Firestore transactions or an idempotent workflow where transactions are unsuitable.

### P1 — Firestore index contract is not formalized

Catalogue queries combine filters and ordering. Required composite indexes should be documented and verified before production deployment.

### P1 — Stored document schemas need stronger contracts

Request validation exists, but persisted documents need stable domain shapes, explicit optional-field semantics and a schema evolution/backfill strategy.

### P2 — Repository conventions should be standardized

Repositories should consistently expose typed document models, CRUD/list methods, ownership-aware access, transaction-aware operations, normalized persistence errors and pagination conventions.

### P2 — Migration/backfill strategy is not formalized

Firestore does not require SQL migrations, but production schema changes still need versioned migration/backfill scripts and a documented rollout/rollback approach.

## Security observation

Firebase Admin credentials are loaded from environment variables; the private-key newline escape is normalized during initialization. No hard-coded credentials were found in the inspected Firebase config.

## Task disposition

**B-002 complete.** The existing Firestore architecture is viable; no database replacement is warranted. The concrete gaps are recorded as follow-up implementation work.

## Next task

**B-003 — Audit all API routes.**
