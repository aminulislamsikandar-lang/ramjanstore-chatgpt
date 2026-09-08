import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authRateLimiter, writeRateLimiter } from "../middleware/rateLimiter.js";
import * as controller from "../controllers/auth.controller.js";

const router = Router();
router.use(authenticate);
router.get("/me", controller.me);
router.post("/sync", authRateLimiter, controller.syncProfile);
router.get("/addresses", controller.listAddresses);
router.post("/addresses", writeRateLimiter, controller.createAddress);
router.patch("/addresses/:id", writeRateLimiter, controller.updateAddress);
router.delete("/addresses/:id", writeRateLimiter, controller.deleteAddress);
export default router;
