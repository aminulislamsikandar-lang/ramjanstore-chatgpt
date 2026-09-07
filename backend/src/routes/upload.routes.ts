import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";
import { bannerUploadSignature, productUploadSignature } from "../controllers/upload.controller.js";

const router = Router();
router.post("/products/signature", authenticate, requireAdmin, productUploadSignature);
router.post("/banners/signature", authenticate, requireAdmin, bannerUploadSignature);
export default router;
