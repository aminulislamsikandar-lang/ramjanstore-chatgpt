# B-025 — Payment / Order Lifecycle Hardening

## Implemented

- Added a single payment transition policy: `PENDING -> AUTHORIZED/PAID/FAILED`, `AUTHORIZED -> PAID/FAILED/REFUNDED`, and `PAID -> REFUNDED`.
- Terminal `FAILED` and `REFUNDED` states cannot transition to another state.
- Payment webhook/application events are deduplicated using the provider event ID as the Firestore document ID.
- Event recording and order payment-status update happen in one Firestore transaction.
- Duplicate provider events become no-ops, preventing double application of the same webhook.
- Provider event IDs and order IDs are length-bounded and validated.
- Added unit tests for transition rules.

## Financial consistency

Payment status is treated as a state machine rather than an arbitrary writable field. Monetary amounts must continue to come from the server-calculated order total; webhook payloads must identify the order/provider event and must not be trusted to overwrite the canonical order amount.

Third-party payment side effects are outside the Firestore transaction. Provider APIs must use their own idempotency facilities for create/capture/refund operations.

**B-025 complete.**
