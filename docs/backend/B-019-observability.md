# B-019 — API Observability

## Implemented

- Every request gets a correlation ID from `X-Request-ID` when it matches a safe character/length policy; otherwise a UUID is generated.
- The ID is exposed as `X-Request-ID` on the response and stored in `res.locals.requestId` for downstream audit/error logging.
- HTTP completion logs are emitted as one-line JSON records containing event, request ID, method, route/path, status and duration.
- Timing uses a monotonic high-resolution clock so wall-clock changes do not distort latency measurements.
- Existing request logger remains enabled; the new middleware adds correlation and structured completion telemetry rather than removing existing logging.

## Privacy

Do not put authorization headers, cookies, request bodies, payment details, or raw tokens into request logs. User-controlled request IDs are length- and character-bounded and are not trusted as authentication data.

## Metrics/tracing

This task establishes reliable request correlation and latency telemetry without adding a paid monitoring dependency. Full OpenTelemetry tracing/metrics export can be layered on later using the same request ID. Until then, JSON logs can be consumed by the deployment platform's native log/metrics tooling.

**B-019 complete.**
