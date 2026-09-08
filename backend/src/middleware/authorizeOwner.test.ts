import { describe, expect, it } from "vitest";
import { isResourceOwner } from "./authorizeOwner.js";

describe("resource ownership", () => {
  const request = { user: { uid: "user-a" } } as any;
  it("allows the authenticated owner", () => expect(isResourceOwner(request, "user-a")).toBe(true));
  it("denies another user's resource", () => expect(isResourceOwner(request, "user-b")).toBe(false));
  it("denies missing or non-string owners", () => { expect(isResourceOwner(request, undefined)).toBe(false); expect(isResourceOwner(request, 123)).toBe(false); });
});
