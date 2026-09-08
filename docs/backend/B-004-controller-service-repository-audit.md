# B-004 — Controllers / Services / Repositories Audit

## Result

The backend has a recognizable controller → service/repository → Firestore structure, but the separation is not yet consistent across domains.

## Findings

### P0 — Checkout controller contains too much domain and persistence logic

`checkout.controller.ts` performs request parsing, idempotency lookup, address ownership, delivery-zone lookup, product reads, pricing, coupon validation, Firestore transaction work, inventory mutation, order creation, and cancellation inventory restoration in the controller itself.

Required follow-up: extract checkout orchestration into a dedicated service and move Firestore reads/writes into order/inventory/payment repositories while keeping the controller limited to transport validation and response mapping.

### P1 — Order routes bypass the service/repository layer

`order.routes.ts` directly imports `db` and queries the `orders` collection for list/detail operations. This duplicates persistence policy outside the domain layer.

Required follow-up: create an order repository and order service, then route all order reads/writes through them.

### P1 — User service owns raw Firestore persistence

The user domain directly manages collection references and Firestore operations instead of using a user/address repository boundary.

### P1 — Error contracts are inconsistent

Some controllers return structured `{ success, error: { code, message } }`, while checkout/order paths often return `{ message }`. Centralized domain-error mapping is needed.

### P1 — Controllers contain repeated pagination/query coercion

Product controllers manually coerce query parameters. A shared validated query schema and pagination helper would reduce inconsistent behavior.

### P1 — Repository typing is incomplete

The product repository uses broad `FirebaseFirestore.Query` and casts such as `as never` and `Record<string, unknown>`. Domain document types should replace broad casts.

### P2 — Repository conventions are inconsistent

Product has a repository, but other domains are mixed between controllers, services, and direct Firestore access. Standardize repositories for users, addresses, orders, cart, payment, coupon, review, wishlist and audit data.

### P2 — Transaction-aware domain operations need explicit interfaces

Inventory and order operations should expose transaction-safe service/repository methods rather than embedding `runTransaction` in HTTP controllers.

## Positive findings

- Product controller delegates CRUD to a product repository.
- Product stock updates use a Firestore transaction.
- Admin routes apply authentication/admin/MFA/audit middleware before sensitive operations.
- Checkout already has server-side price, stock, coupon and idempotency protections.

## Task disposition

**B-004 complete as an audit task.** No broad refactor was made during the audit because extracting domains safely requires preserving current API behavior and tests. Findings should become focused implementation tasks rather than a risky one-shot rewrite.

## Next task

**B-005 — Audit environment variables and secrets.**
