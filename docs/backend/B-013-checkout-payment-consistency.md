# B-013 — Checkout / Payment Consistency & Failure Recovery

## Audit result

Checkout currently uses a Firestore transaction for the critical inventory, coupon usage, order creation and idempotency-record writes. This gives the COD flow atomicity: a failed transaction does not leave a partially-created order or partially-decremented stock. The implementation also re-reads inventory inside the transaction, preventing stale pre-check data from being committed. fileciteturn209file0

## Hardening added

A central payment-state transition guard now defines the permitted lifecycle:

`PENDING → AUTHORIZED → PAID → REFUNDED`

with failure/retry paths:

`PENDING → FAILED → PENDING`

Invalid rollback transitions such as `PAID → PENDING` and `REFUNDED → PAID` are rejected.

## Important architecture boundary

The current checkout flow is COD (`paymentMethod: "COD"`, `paymentStatus: "PENDING"`). There is no active online payment-provider integration in the inspected checkout path, so this task does **not** pretend to implement a gateway flow that does not exist.

When an online gateway is introduced, provider webhook handling must:

1. Verify the provider signature.
2. Deduplicate webhook events by provider event ID.
3. Load the order transactionally.
4. Validate amount/currency/order ownership against the stored order.
5. Apply `assertPaymentTransition()` before changing payment state.
6. Record provider transaction/event IDs for reconciliation.
7. Never decrement inventory again from a payment webhook; inventory belongs to the checkout transaction.
8. Mark failed/expired payments recoverable without creating a second order.

## Recovery principle

A payment-provider timeout must not be interpreted as payment failure without provider confirmation. The order should remain recoverable (`PENDING`) until a verified webhook/status check establishes the final state.

**B-013 foundation complete.**
