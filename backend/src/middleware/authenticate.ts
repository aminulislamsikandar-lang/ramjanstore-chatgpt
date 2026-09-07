import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebase.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: "owner" | "staff";
    auth: { mfa: boolean; authTime: number };
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
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

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "owner" && req.user?.role !== "staff") return res.status(403).json({ message: "Admin access required" });
  next();
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "owner") return res.status(403).json({ message: "Owner access required" });
  next();
}
