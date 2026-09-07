import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";
import { requireMfa } from "../middleware/requireMfa.js";
import { bannerUploadSignature, productUploadSignature } from "../controllers/upload.controller.js";

const router = Router();
router.post("/products/signature", authenticate, requireAdmin, requireMfa, productUploadSignature);
router.post("/banners/signature", authenticate, requireAdmin, requireMfa, bannerUploadSignature);
export default router;
