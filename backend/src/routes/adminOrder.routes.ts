import {Router} from "express";
import {authenticate} from "../middleware/authenticate.js";
import {requireAdmin} from "../middleware/requireAdmin.js";
import {orders,status,dashboardStats} from "../controllers/adminOrder.controller.js";
const r=Router(); r.use(authenticate,requireAdmin); r.get("/orders",orders); r.patch("/orders/:id/status",status); r.get("/stats",dashboardStats); export default r;
