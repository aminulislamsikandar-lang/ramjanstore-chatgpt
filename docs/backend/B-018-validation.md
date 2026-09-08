# B-018 — Input Validation, API Schema Consistency & Error Handling

## Implemented

- Central Zod validation middleware for body, query and route parameters.
- Validation uses `safeParse` and forwards `ZodError` to the existing centralized error handler.
- Shared strict ID parameter schemas.
- Shared pagination schema with a safe maximum of 100 results.
- Cursor values are bounded to prevent oversized query input.
- Strict schemas reject unexpected fields when adopted by routes.
- Existing error handling maps validation failures to a stable `VALIDATION_ERROR` response with field-level issue details and request IDs.

## Contract

Validation middleware must run before controllers. Controllers should receive already-parsed values and should not duplicate basic shape validation. Business rules (stock, ownership, coupon eligibility, etc.) remain in services/controllers and are not replaced by transport validation.

## Remaining adoption rule

New endpoints must use `validateBody`, `validateQuery`, or `validateParams` with a route-specific Zod schema. Existing controllers that perform business-level validation remain compatible with the centralized error contract.

**B-018 complete.**
