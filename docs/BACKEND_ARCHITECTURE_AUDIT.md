# RamjanStore Backend Architecture Audit

**Audit task:** B-001 — Complete backend architecture audit
**Branch:** main
**Audit date:** 2026-09-08

## 1. Current architecture

The backend is an Express 5 + TypeScript service organized into configuration, Firebase, Cloudinary, middleware, controllers, repositories, routes, schemas, services, and utilities. The root workspace exposes dedicated backend dev/build/type-check/test scripts, while the backend package uses Vitest for its own test suite.

## 2. Current layers observed

- **HTTP/application:** `backend/src/app.ts`, `server.ts`
- **Routes:** auth, commerce, engagement, orders, products, uploads, admin orders
- **Controllers:** auth, checkout, engagement, products, uploads, admin orders
- **Services:** checkout invariants, order lifecycle, coupons, delivery zones, users, admin orders, audit, engagement
- **Repositories:** product repository currently present
- **Schemas:** dedicated schema directory present
- **Middleware:** request logging, rate limiting, not-found, error handling, authentication/authorization support
- **Infrastructure/config:** Firebase, Cloudinary, environment configuration

## 3. Confirmed strengths

- Express security middleware is configured with Helmet.
- CORS is explicitly allowlisted through environment-driven origins.
- JSON and URL-encoded request bodies have 1 MB limits.
- API rate limiting is enabled.
- Request logging, not-found handling, and centralized error handling are present.
- `Idempotency-Key` is already accepted as a request header, indicating idempotency was considered at the API boundary.
- Firebase Admin and Zod are available for authentication and validation.
- Dedicated order lifecycle and checkout-invariant modules already exist and have tests.
- Graceful server shutdown handling is already present.

## 4. Architecture gaps / risks requiring follow-up

### Critical

1. **Persistence abstraction is incomplete:** only a product repository was observed. Order, payment, inventory, address, coupon, review, notification, and audit persistence boundaries need to be verified and standardized.
2. **Transactional boundaries need verification:** checkout/order/inventory/payment operations must have a safe atomicity strategy appropriate to the actual datastore.
3. **Authorization must be audited end-to-end:** route middleware, role checks, and resource ownership must be verified for every protected operation.
4. **Payment boundary is not yet represented as a clearly isolated provider abstraction:** this should be established before production payment integration.

### High

5. **Environment configuration should be treated as a single validated contract.**
6. **API response/error contracts should be consistent across all controllers.**
7. **Health checks need separate liveness/readiness semantics and dependency checks.**
8. **Idempotency needs actual persistence/processing semantics, not only header acceptance.**
9. **Background-job boundaries are not yet evident for notifications, reconciliation, cleanup, and other asynchronous work.**
10. **Backend integration/HTTP tests need broader coverage beyond invariant/unit tests.**

### Medium

11. Database indexing/query-performance strategy should be documented and verified.
12. Structured logging and operational metrics should be standardized.
13. Audit logging should be applied consistently to security-sensitive/admin mutations.
14. API versioning and backwards-compatibility rules should be documented.

## 5. Dependency map

```text
HTTP Request
   ↓
Security / CORS / Rate Limit / Request Logging
   ↓
Route
   ↓
Auth + Authorization
   ↓
Validation Schema
   ↓
Controller
   ↓
Service / Business Rules
   ↓
Repository / External Provider
   ↓
Persistent State
   ↓
Response / Error Handler
```

Business-critical flows such as checkout should additionally use an explicit transaction/idempotency boundary:

```text
Checkout Request
   ↓
Authenticate + Validate
   ↓
Idempotency Check
   ↓
Re-read authoritative product/price/stock
   ↓
Transaction / Reservation
   ↓
Order + Inventory + Payment State
   ↓
Commit
   ↓
Async side effects (notifications, reconciliation)
```

## 6. Task disposition

B-001 is complete as an architecture-level audit. The findings become the basis for B-002 onward; implementation tasks must verify each finding against the concrete source before changing behavior.

## 7. Next task

**B-002 — Audit database/persistence layer**

Focus: identify the actual datastore, all persistence mechanisms, entity ownership, consistency guarantees, indexes, transaction capabilities, and missing repositories before implementing changes.
