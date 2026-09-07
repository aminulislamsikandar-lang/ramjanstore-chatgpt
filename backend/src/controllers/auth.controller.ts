import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { addressSchema, profileSyncSchema } from "../schemas/auth.schema.js";
import * as service from "../services/user.service.js";

export async function syncProfile(req: AuthenticatedRequest, res: Response) { const input = profileSyncSchema.parse(req.body); const data = await service.syncUserProfile(req.user!.uid, input); res.json({ success: true, data }); }
export async function me(req: AuthenticatedRequest, res: Response) { const data = await service.getUserProfile(req.user!.uid); res.json({ success: true, data }); }
export async function listAddresses(req: AuthenticatedRequest, res: Response) { res.json({ success: true, data: await service.listAddresses(req.user!.uid) }); }
export async function createAddress(req: AuthenticatedRequest, res: Response) { const input = addressSchema.parse(req.body); res.status(201).json({ success: true, data: await service.createAddress(req.user!.uid, input) }); }
export async function updateAddress(req: AuthenticatedRequest, res: Response) { const input = addressSchema.partial().parse(req.body); const data = await service.updateAddress(req.user!.uid, req.params.id, input); if (!data) return res.status(404).json({ success: false, error: { code: "ADDRESS_NOT_FOUND", message: "Address not found." } }); return res.json({ success: true, data }); }
export async function deleteAddress(req: AuthenticatedRequest, res: Response) { const ok = await service.deleteAddress(req.user!.uid, req.params.id); if (!ok) return res.status(404).json({ success: false, error: { code: "ADDRESS_NOT_FOUND", message: "Address not found." } }); return res.status(204).send(); }
