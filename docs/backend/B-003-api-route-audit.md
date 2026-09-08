# B-003 — API Route Audit

## Scope

Audited the backend API registration and all route modules currently present under `backend/src/routes`.

The API router is mounted at `/api/v1` and currently registers auth, products, uploads, orders, admin orders, engagement, delivery zones, coupons, checkout and cancellation routes.

## Route inventory

### Auth
- `GET /auth/me` — authenticated customer
- `POST /auth/sync` — authenticated customer
- `GET /auth/addresses` — authenticated customer
- `POST /auth/addresses` — authenticated customer
- `PATCH /auth/addresses/:id` — authenticated customer
- `DELETE /auth/addresses/:id` — authenticated customer

### Products
- `GET /products/`
- `GET /products/admin/list` — admin
- `POST /products/admin` — admin + MFA
- `PATCH /products/admin/:id` — admin + MFA
- `PATCH /products/admin/:id/stock` — admin + MFA
- `DELETE /products/admin/:id` — admin + MFA
- `GET /products/:identifier`

### Uploads
- `POST /uploads/products/signature` — admin + MFA
- `POST /uploads/banners/signature` — admin + MFA

### Customer orders
- `GET /orders/` — authenticated, own orders
- `GET /orders/:orderId` — authenticated, ownership enforced
- `POST /orders/:orderId/cancel` — authenticated

### Admin orders
- `GET /admin/orders` — admin
- `PATCH /admin/orders/:id/status` — admin + MFA + audit logging
- `GET /admin/stats` — admin

### Engagement
- `GET /wishlist` — authenticated
- `POST /wishlist/:productId/toggle` — authenticated
- `POST /likes/:productId/toggle` — authenticated
- `POST /ratings/:productId` — authenticated
- `POST /comments/:productId` — authenticated
- `GET /admin/moderation` — admin
- `PATCH /admin/moderation` — admin + MFA + audit logging

### Commerce
- `GET /delivery-zones/lookup` — public
- `GET /delivery-zones` — admin
- `POST /delivery-zones` — admin + MFA
- `PATCH /delivery-zones/:id` — admin + MFA
- `DELETE /delivery-zones/:id` — admin + MFA
- `POST /coupons/validate` — authenticated
- `GET /coupons` — admin
- `POST /coupons` — admin + MFA
- `PATCH /coupons/:id` — admin + MFA
- `DELETE /coupons/:id` — admin + MFA
- `POST /checkout/process` — authenticated
- `POST /orders/:orderId/cancel` — authenticated

## Findings

### P0 — Duplicate cancellation route

`POST /orders/:orderId/cancel` is registered in both `order.routes.ts` and `commerce.routes.ts`. Both point to the same controller, so this is currently functionally redundant but creates route ownership ambiguity and should be reduced to one canonical registration.

### P1 — Engagement mutation inputs are not validated at the route/controller boundary

The engagement controller casts request bodies directly for ratings and comments. These endpoints need explicit Zod schemas for rating stars, text length/content, parent comment IDs and moderation payloads.

### P1 — Query parameters are inconsistently validated

Product pagination values are clamped in the controller, while other list endpoints pass raw query strings into services. Admin order filters and order listing should use explicit query schemas with bounded pagination and known enum values.

### P1 — API contract is inconsistent

Some errors use `{ message }`, while others use `{ success:false, error:{ code, message } }`. A single API error contract should be enforced across all route families.

### P1 — No machine-readable API specification found

No OpenAPI/Swagger specification was found. A generated OpenAPI contract would make frontend integration, regression testing and production API review safer.

### P1 — Route-level rate-limit policy is not explicit

A global rate limiter exists at application level, but sensitive mutation endpoints should have endpoint-specific policies, especially checkout, comments/ratings and admin operations.

### P2 — Route organization can be improved

`commerce.routes.ts` currently owns delivery zones, coupons, checkout and order cancellation. Splitting these into domain-specific route modules would make ownership and authorization review clearer.

### P2 — Response envelope consistency

Most endpoints use `{success:true,data:...}`, but some use `{success:true,zone:...}` or `{success:true,coupon:...}`. This should be standardized before public API stabilization.

## Security positives

- Authentication middleware is applied to customer-protected route groups.
- Admin routes use `requireAdmin`.
- Sensitive admin mutations use MFA.
- Admin status/moderation mutations include audit middleware.
- Order detail lookup verifies that the authenticated user owns the order.
- Checkout is authenticated and requires an idempotency key.

## Task disposition

**B-003 complete as an audit task.** No broad route rewrite was performed because route behavior is already consumed by the storefront/admin clients. Concrete implementation gaps are recorded above.

## Follow-up implementation tasks

- Remove duplicate cancellation registration.
- Add shared request/query validation middleware/schemas.
- Standardize API response/error envelopes.
- Add OpenAPI specification.
- Add route-specific rate limits.
- Split commerce routes by domain where useful.

## Next task

**B-004 — Audit controllers/services/repositories.**
