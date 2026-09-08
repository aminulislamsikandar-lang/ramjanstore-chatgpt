# RamjanStore Backend — Database / Persistence Audit (B-002)

## Scope
Audit the current Firestore persistence layer for integrity, consistency, reliability, and query safety.

## Current persistence architecture
- Firestore is the primary persistence layer.
- A shared Firestore database instance is used by repositories/services.
- Domain logic is kept above the persistence boundary rather than embedding database operations in HTTP routes.
- Transactional writes are already used for critical inventory reservation/stock operations.

## Existing strengths
1. Firestore is centralized behind the backend Firebase integration.
2. Inventory reservation uses transactional semantics, reducing oversell risk under concurrent checkout.
3. Server-side validation is present before important writes.
4. Request-level idempotency exists for checkout operations.
5. Audit-log persistence infrastructure exists.
6. Environment configuration is validated before application startup.

## Gaps identified
- There is no single documented schema contract covering every persisted collection/document.
- Cross-domain invariants (order/payment/inventory) need a complete transaction-boundary audit.
- Payment persistence is not yet a complete domain, so payment/order reconciliation cannot currently be guaranteed.
- Index requirements should be documented alongside repository queries and checked during deployment.
- Retention/cleanup policies for temporary reservation/idempotency data need explicit operational rules.
- Backup/restore and disaster-recovery procedures are still outstanding.
- Persistence-level integration tests need broader coverage across orders, coupons, reviews, addresses, and future payment data.

## Required persistence rules
- Never trust client-supplied prices, stock, totals, ownership, or privileged fields.
- Use Firestore transactions for operations whose correctness depends on a read-then-write invariant.
- Keep monetary values deterministic and avoid floating-point calculations for persisted financial totals where practical.
- Keep immutable order snapshots for product/price data used at checkout.
- Use server timestamps for authoritative lifecycle/audit timestamps.
- Make retry-sensitive writes idempotent.
- Do not expose internal Firestore errors directly to clients.

## B-002 result
**Status: Partial.** The persistence foundation is production-oriented and already has transactional inventory protection, but a complete schema/index/transaction/backup/restore audit requires the remaining commerce domains—especially payments and invoices—to be implemented or finalized.

## Next persistence follow-up
B-017 (data constraints), B-018 (complete transaction audit), B-020 (query optimization), and B-188–B-190 (migration/backup/restore strategy).
