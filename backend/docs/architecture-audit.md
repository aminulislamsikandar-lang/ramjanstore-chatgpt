# RamjanStore Backend — Architecture Audit

**Audit date:** 2026-09-08  
**Branch:** `main`

## 1. Architecture summary

The backend is an Express 5 + TypeScript service using Firebase Admin/Firestore as its persistence layer. The codebase is organized into configuration, Firebase integration, middleware, routes, controllers, repositories, services, schemas, jobs, and shared utilities.

```text
HTTP request
  -> security/hardening middleware
  -> observability/request logging
  -> JSON/urlencoded parsers
  -> global rate limiting
  -> CSRF/origin guard
  -> /api/v1 routes
       -> authentication/authorization
       -> controllers
       -> services
       -> repositories / Firebase
  -> not-found / centralized error handler
```

## 2. Existing architectural strengths

- TypeScript with strict build tooling.
- Express 5 application composition is centralized in `src/app.ts`.
- Production security middleware includes Helmet, CORS allowlisting, body-size limits, rate limiting and origin protection.
- Request correlation and structured request logging are present.
- Firebase Admin token verification is isolated in authentication middleware.
- Domain logic is separated into services and persistence access into repositories where appropriate.
- Zod schemas are used for request/environment validation.
- Firestore transactions are used for inventory reservation and stock mutation.
- Checkout idempotency and inventory reservation provide important reliability guarantees.
- Admin actions have an audit middleware/service path.
- The server has graceful and forced shutdown handling.
- Automated tests are already present and run through Vitest.

## 3. Current route/domain surface

The current route layer contains:

- authentication
- products/catalogue
- commerce/checkout-related operations
- orders
- admin order operations
- engagement/reviews/wishlist-related operations
- uploads

The architecture is therefore already domain-oriented rather than a single monolithic controller.

## 4. Known architectural gaps

The following are intentionally recorded as follow-up work rather than silently treated as complete:

1. **Granular permissions:** RBAC exists, but a reusable permission matrix such as `products.read`, `products.write`, `orders.read`, etc. is not yet established.
2. **Payments:** a complete payment abstraction, verification/webhook/reconciliation lifecycle is still required.
3. **Tax/GST:** the checkout architecture needs a dedicated tax calculation boundary.
4. **Invoices:** invoice generation/storage/download is not yet a first-class domain module.
5. **Notifications:** notification persistence and delivery abstractions are not yet complete.
6. **Customer/address:** customer-facing address management needs a dedicated, consistent domain boundary.
7. **Observability:** readiness currently verifies Firestore; dependency-specific health checks and business metrics remain incomplete.
8. **Performance:** caching, query profiling and formal load testing remain follow-up work.
9. **Deployment:** migration, backup/restore, smoke-test and rollback procedures remain to be formalized.

## 5. Dependency boundary

The backend currently depends on:

- Express
- Firebase Admin / Firestore
- Cloudinary
- Helmet
- CORS
- express-rate-limit
- Zod
- dotenv

There is no dedicated payment SDK or email provider dependency in the current backend package manifest, so payment/email work should be introduced behind explicit service interfaces rather than coupled directly into controllers.

## 6. Architectural rules for future work

1. Routes should remain thin and delegate business rules to services.
2. Controllers should not contain Firestore transaction logic.
3. Repositories should own persistence queries/mutations where a repository exists.
4. All authenticated resource access must enforce ownership or an explicit permission.
5. Financial values must be calculated server-side from trusted persisted data.
6. Multi-document inventory/order/payment mutations must use transactions or an equivalent atomic/idempotent strategy.
7. New externally visible failures must use the centralized error/response contract.
8. New privileged mutations should emit audit events.
9. New write endpoints must have appropriate rate limits and validation.
10. New domain features should include tests before being marked complete.

## 7. Audit conclusion

**B-001 — Complete.** The backend has a viable layered architecture and the major remaining work is now explicitly separated into domain-specific implementation tasks. Future tasks should build on this structure rather than introduce parallel architectural patterns.
