import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";
import { writeAuditLog } from "../services/audit.service.js";

export function auditAdminAction(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  res.once("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) return;
    const role = req.user.role;
    if (role !== "owner" && role !== "staff") return;
    const segments = req.path.split("/").filter(Boolean);
    const resource = segments[0] ?? "admin";
    const resourceId = segments[1] && !["admin", "products", "orders", "coupons", "delivery-zones", "uploads", "moderation"].includes(segments[1]) ? segments[1] : undefined;
    void writeAuditLog({
      actorId: req.user.uid,
      actorRole: role,
      action: `${req.method} ${req.path}`,
      resource,
      resourceId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    }).catch(() => undefined);
  });
  next();
}
