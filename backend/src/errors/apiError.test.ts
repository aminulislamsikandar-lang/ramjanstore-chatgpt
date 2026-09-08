import { describe, expect, it } from "vitest";
import { ApiError, badRequest, conflict, forbidden, notFound, tooManyRequests, unauthorized } from "./apiError.js";

describe("ApiError", () => {
  it("creates operational errors with stable code and status", () => {
    const error = new ApiError(422, "TEST_ERROR", "Invalid input", { field: "x" });
    expect(error).toMatchObject({ statusCode: 422, code: "TEST_ERROR", message: "Invalid input", details: { field: "x" }, isOperational: true });
  });

  it("provides standard HTTP helpers", () => {
    expect(badRequest("BAD", "bad").statusCode).toBe(400);
    expect(unauthorized().statusCode).toBe(401);
    expect(forbidden().statusCode).toBe(403);
    expect(notFound("MISSING", "missing").statusCode).toBe(404);
    expect(conflict("DUPLICATE", "duplicate").statusCode).toBe(409);
    expect(tooManyRequests().statusCode).toBe(429);
  });
});
