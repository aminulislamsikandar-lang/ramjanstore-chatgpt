import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { createUploadSignature } from "../cloudinary/signature.js";

export function productUploadSignature(_req: AuthenticatedRequest, res: Response) {
  res.json(createUploadSignature("products"));
}

export function bannerUploadSignature(_req: AuthenticatedRequest, res: Response) {
  res.json(createUploadSignature("banners"));
}
