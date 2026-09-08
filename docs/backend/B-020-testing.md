# B-020 — Automated Testing Coverage & Integration Reliability

## Implemented

- Confirmed backend uses Vitest through the existing `test` script (`vitest run`).
- Added focused validation-schema tests covering defaults, coercion, upper bounds and strict unknown-field rejection.
- Added ID validation tests for empty and unexpected route parameters.
- Kept tests deterministic and independent of Firestore/network services.

## Test strategy

Unit tests should cover pure services and validation first. Integration tests should exercise Express routes with mocked Firebase/provider boundaries. E2E tests should be reserved for critical checkout, authentication, payment webhook and order lifecycle flows and run against an isolated test project/environment.

## Reliability rule

No test should require production credentials, production Firestore, real payment capture, or real customer notifications. External effects must be mocked or routed to a dedicated test environment.

**B-020 foundation complete.**
