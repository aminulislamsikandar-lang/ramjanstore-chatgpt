import { describe, expect, it } from "vitest";
import { hasRole } from "./authenticate.js";

describe("RBAC helpers", () => {
  const request = (role?: "owner" | "staff") => ({ user: role ? { uid: "u1", role, auth: { mfa: true, authTime: 1 } } : undefined } as any);
  it("allows only owner/staff for admin", () => {
    expect(hasRole(request("owner"), ["owner", "staff"])).toBe(true);
    expect(hasRole(request("staff"), ["owner", "staff"])).toBe(true);
    expect(hasRole(request(), ["owner", "staff"])).toBe(false);
  });
  it("keeps owner permission distinct from staff", () => {
    expect(hasRole(request("owner"), ["owner"])).toBe(true);
    expect(hasRole(request("staff"), ["owner"])).toBe(false);
  });
});
