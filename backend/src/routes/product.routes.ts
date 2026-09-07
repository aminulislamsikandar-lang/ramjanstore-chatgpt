import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";
import * as controller from "../controllers/product.controller.js";

const router = Router();
router.get("/", controller.listProducts);
router.get("/admin/list", authenticate, requireAdmin, controller.listAdminProducts);
router.post("/admin", authenticate, requireAdmin, controller.createProduct);
router.patch("/admin/:id", authenticate, requireAdmin, controller.updateProduct);
router.patch("/admin/:id/stock", authenticate, requireAdmin, controller.updateStock);
router.delete("/admin/:id", authenticate, requireAdmin, controller.deactivateProduct);
router.get("/:identifier", controller.getProduct);
export default router;
