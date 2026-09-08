import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";

export function isResourceOwner(req: AuthenticatedRequest, ownerId: unknown): boolean {
  const uid = req.user?.uid;
  return typeof uid === "string" && uid.length > 0 && typeof ownerId === "string" && ownerId === uid;
}

export function requireResourceOwner(ownerIdKey = "ownerId") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!isResourceOwner(req, res.locals[ownerIdKey])) return res.status(404).json({ message: "Resource not found" });
    next();
  };
}

export function assertResourceOwner(req: AuthenticatedRequest, ownerId: unknown): void {
  if (!isResourceOwner(req, ownerId)) {
    const error = new Error("Resource not found") as Error & { statusCode?: number; code?: string; isOperational?: boolean };
    error.statusCode = 404;
    error.code = "RESOURCE_NOT_FOUND";
    error.isOperational = true;
    throw error;
  }
}
