import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";

/**
 * Firebase ID tokens expose auth_time and sign_in_provider in the token's
 * authentication context. We require an MFA factor for privileged mutations.
 * The authenticate middleware must attach auth context for this guard.
 */
export function requireMfa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.user?.auth;
  if (!auth?.mfa) return res.status(403).json({ message: "Multi-factor authentication is required for this operation" });
  next();
}
