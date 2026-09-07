import { Router } from "express";
import uploadRoutes from "./upload.routes.js";

export const apiRouter = Router();

apiRouter.use("/uploads", uploadRoutes);

export default apiRouter;
