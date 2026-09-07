import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { listOrders, stats, transitionOrder, type OrderStatus } from "../services/adminOrder.service.js";
export async function orders(req:AuthenticatedRequest,res:Response){res.json({success:true,data:await listOrders(req.query as Record<string,string>)});}
export async function status(req:AuthenticatedRequest,res:Response){res.json({success:true,data:await transitionOrder(req.params.id,(req.body as {status:OrderStatus}).status)});}
export async function dashboardStats(_req:AuthenticatedRequest,res:Response){res.json({success:true,data:await stats()});}
