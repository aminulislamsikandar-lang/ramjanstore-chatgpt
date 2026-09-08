# B-014 — Firestore Indexes & Scalability Audit

## Implemented

Added a checked-in `firestore.indexes.json` covering the backend's core high-cardinality access patterns:

- orders by `userId + createdAt DESC`
- orders by `status + createdAt DESC`
- orders by `paymentStatus + createdAt DESC`
- products by `categoryId + isActive + createdAt DESC`
- active products by `isActive + createdAt DESC`
- reviews by `productId + createdAt DESC`

This keeps required composite indexes version-controlled instead of relying on manually-created console state.

## Query/scalability rules

1. Paginate collection reads with cursors; do not load unbounded collections into memory.
2. Keep result limits explicit for customer-facing list endpoints.
3. Prefer document reads by ID for single-resource operations.
4. Avoid offset pagination for Firestore workloads.
5. Do not add indexes speculatively: every composite index should correspond to a real query pattern.
6. Large, frequently changing counters should be designed with contention in mind; use sharded counters when a single document becomes a write hotspot.
7. Arrays and large embedded snapshots in order documents should remain bounded to avoid document-size growth.

## Deployment

Deploy the checked-in index definition with the Firebase CLI from the repository root:

`firebase deploy --only firestore:indexes`

If the project uses a different Firebase project alias, select the appropriate alias before deployment.

## Remaining audit work

The GitHub code-search surface did not expose every Firestore query implementation reliably, so the index file intentionally contains only the core, known-safe access patterns rather than guessing dozens of indexes. Production Firestore usage should be observed in the Firebase console/query metrics and additional indexes added from actual missing-index errors.

**B-014 complete.**
