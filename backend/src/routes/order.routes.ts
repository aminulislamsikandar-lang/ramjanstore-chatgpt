import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/authenticate.js";
import { assertResourceOwner } from "../middleware/authorizeOwner.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../firebase/firestore.js";
import { cancelOrder } from "../controllers/checkout.controller.js";
import { failure, success } from "../utils/apiResponse.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(async (req, res) => {
  const request = req as AuthenticatedRequest;
  const snapshot = await db.collection("orders")
    .where("userId", "==", request.user!.uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return success(res, snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
}));

router.get("/:orderId", asyncHandler(async (req, res) => {
  const request = req as AuthenticatedRequest;
  const doc = await db.collection("orders").doc(req.params.orderId).get();
  if (!doc.exists) return failure(res, 404, "ORDER_NOT_FOUND", "Order not found.");
  try {
    assertResourceOwner(request, doc.data()?.userId);
  } catch {
    return failure(res, 404, "ORDER_NOT_FOUND", "Order not found.");
  }
  return success(res, { id: doc.id, ...doc.data() });
}));

router.post("/:orderId/cancel", asyncHandler(cancelOrder));

export default router;
