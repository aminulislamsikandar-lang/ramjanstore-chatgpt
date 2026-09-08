import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebase.js";

export type AdminRole = "owner" | "staff";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: AdminRole;
    auth: { mfa: boolean; authTime: number };
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });
    const token = header.slice(7).trim();
    if (!token || token.length > 8192) return res.status(401).json({ message: "Invalid authentication token" });
    // checkRevoked=true ensures revoked Firebase sessions are rejected, not just expired tokens.
    const decoded = await adminAuth.verifyIdToken(token, true);
    const role = decoded.role === "owner" || decoded.role === "staff" ? decoded.role : undefined;
    const firebase = decoded.firebase as { sign_in_second_factor?: unknown } | undefined;
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role,
      auth: { mfa: typeof firebase?.sign_in_second_factor === "string", authTime: decoded.auth_time },
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

export function hasRole(req: AuthenticatedRequest, roles: readonly AdminRole[]) {
  return !!req.user?.role && roles.includes(req.user.role);
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!hasRole(req, ["owner", "staff"])) return res.status(403).json({ message: "Admin access required" });
  next();
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!hasRole(req, ["owner"])) return res.status(403).json({ message: "Owner access required" });
  next();
}

export function requireRole(...roles: AdminRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!hasRole(req, roles)) return res.status(403).json({ message: "Insufficient permissions" });
    next();
  };
}
