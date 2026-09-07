import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";
import { requireMfa } from "../middleware/requireMfa.js";
import { wishlist, wishlistItems, like, rating, comment, moderation, moderationList } from "../controllers/engagement.controller.js";

const router = Router();
router.use(authenticate);
router.get("/wishlist", wishlistItems);
router.post("/wishlist/:productId/toggle", wishlist);
router.post("/likes/:productId/toggle", like);
router.post("/ratings/:productId", rating);
router.post("/comments/:productId", comment);
router.get("/admin/moderation", requireAdmin, moderationList);
router.patch("/admin/moderation", requireAdmin, requireMfa, moderation);
export default router;
