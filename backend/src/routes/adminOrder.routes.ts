import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";
import { requireMfa } from "../middleware/requireMfa.js";
import { auditAdminAction } from "../middleware/auditAdminAction.js";
import { orders, status, dashboardStats } from "../controllers/adminOrder.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/orders", orders);
router.patch("/orders/:id/status", requireMfa, auditAdminAction, status);
router.get("/stats", dashboardStats);
export default router;
