# B-030 — Customer Authorization & IDOR/BOLA Protection

## Implemented

- Added reusable `isResourceOwner()`, `requireResourceOwner()` and `assertResourceOwner()` guards.
- Customer order listing is scoped directly by the authenticated Firebase UID.
- Customer order detail now uses the centralized ownership guard and returns the same `ORDER_NOT_FOUND` response for missing and non-owned orders, reducing resource-existence disclosure.
- Checkout validates that the supplied address belongs to the authenticated user before using it.
- Order cancellation verifies ownership inside the Firestore transaction immediately before mutation, protecting against TOCTOU-style authorization gaps.
- Admin routes remain separated behind role-based authorization.

## BOLA/IDOR rule

Never authorize a customer resource from a client-supplied user ID. Derive the caller identity exclusively from the verified Firebase token and compare it with the persisted resource owner inside the server-side read/mutation boundary.

List endpoints should query by the authenticated UID rather than fetch all records and filter in application code. Mutation endpoints should repeat the ownership check in the transaction when the resource can change concurrently.

## Privacy behavior

For customer-owned resources, return a generic not-found response when the resource is absent or belongs to another user. This prevents attackers from using authorization failures to enumerate valid order IDs.

**B-030 complete.**
