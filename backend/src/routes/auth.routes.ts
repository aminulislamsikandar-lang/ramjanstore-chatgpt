import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../controllers/auth.controller.js";

const router = Router();
router.use(authenticate);
router.get("/me", controller.me);
router.post("/sync", controller.syncProfile);
router.get("/addresses", controller.listAddresses);
router.post("/addresses", controller.createAddress);
router.patch("/addresses/:id", controller.updateAddress);
router.delete("/addresses/:id", controller.deleteAddress);
export default router;
